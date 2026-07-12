const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const FuelLog = require('../models/Fuel');

// NOTE: Mongo transactions require a replica set, which a local standalone
// MongoDB Community Server instance does not provide. Business-rule checks
// below use a "validate everything, then write" pattern to keep the window
// for inconsistency as small as possible without depending on multi-document
// transactions. If you deploy against a replica set / Atlas, this is a good
// spot to add mongoose sessions back in.

// @route  GET /api/trips
// Supports ?status=&vehicle=&driver=
const getTrips = asyncHandler(async (req, res) => {
  const { status, vehicle, driver } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (vehicle) filter.vehicle = vehicle;
  if (driver) filter.driver = driver;

  const trips = await Trip.find(filter)
    .populate('vehicle', 'registrationNumber name type maxLoadCapacity status')
    .populate('driver', 'name licenseNumber status')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: trips.length, data: trips });
});

// @route  GET /api/trips/:id
const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id).populate('vehicle').populate('driver');
  if (!trip) throw new ApiError(404, 'Trip not found');
  res.status(200).json({ success: true, data: trip });
});

// @route  POST /api/trips
// @access Private (driver, fleet_manager)
// Creates a trip in Draft status. Full assignability checks run at dispatch time,
// but we validate cargo weight against vehicle capacity up front too.
const createTrip = asyncHandler(async (req, res) => {
  const { source, destination, vehicle, driver, cargoWeight, distance } = req.body;

  if (!source || !destination || !vehicle || !driver || cargoWeight == null || distance == null) {
    throw new ApiError(
      400,
      'source, destination, vehicle, driver, cargoWeight and distance are all required'
    );
  }

  const [vehicleDoc, driverDoc] = await Promise.all([
    Vehicle.findById(vehicle),
    Driver.findById(driver),
  ]);

  if (!vehicleDoc) throw new ApiError(404, 'Vehicle not found');
  if (!driverDoc) throw new ApiError(404, 'Driver not found');

  // Business rule: Cargo weight must not exceed the vehicle's maximum load capacity.
  if (cargoWeight > vehicleDoc.maxLoadCapacity) {
    throw new ApiError(
      422,
      `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicleDoc.maxLoadCapacity}kg)`
    );
  }

  const trip = await Trip.create({
    source,
    destination,
    vehicle,
    driver,
    cargoWeight,
    distance,
    status: 'Draft',
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: trip });
});

// @route  PUT /api/trips/:id
// @access Private (driver, fleet_manager)
// Generic edit - only permitted while the trip is still in Draft.
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, 'Trip not found');

  if (trip.status !== 'Draft') {
    throw new ApiError(409, `Trip cannot be edited once it is ${trip.status}`);
  }

  const editableFields = ['source', 'destination', 'vehicle', 'driver', 'cargoWeight', 'distance'];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) trip[field] = req.body[field];
  });

  const vehicleDoc = await Vehicle.findById(trip.vehicle);
  if (!vehicleDoc) throw new ApiError(404, 'Vehicle not found');
  if (trip.cargoWeight > vehicleDoc.maxLoadCapacity) {
    throw new ApiError(
      422,
      `Cargo weight (${trip.cargoWeight}kg) exceeds vehicle capacity (${vehicleDoc.maxLoadCapacity}kg)`
    );
  }

  await trip.save();
  res.status(200).json({ success: true, data: trip });
});

// @route  POST /api/trips/:id/dispatch
// @access Private (fleet_manager, driver)
// Runs the full set of assignability business rules, then flips both the
// vehicle and driver to "On Trip".
const dispatchTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status !== 'Draft') {
    throw new ApiError(409, `Only Draft trips can be dispatched (current status: ${trip.status})`);
  }

  const vehicle = await Vehicle.findById(trip.vehicle);
  const driver = await Driver.findById(trip.driver);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  if (!driver) throw new ApiError(404, 'Driver not found');

  // Retired or In Shop vehicles must never be dispatched.
  if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
    throw new ApiError(422, `Vehicle is ${vehicle.status} and cannot be dispatched`);
  }
  // Vehicle already On Trip cannot be assigned again.
  if (vehicle.status !== 'Available') {
    throw new ApiError(422, `Vehicle must be Available to dispatch (current: ${vehicle.status})`);
  }

  // Expired licenses cannot be assigned.
  if (driver.licenseExpiry < new Date()) {
    throw new ApiError(422, 'Driver license has expired and cannot be assigned');
  }
  // Suspended drivers, or drivers already On Trip / Off Duty, cannot be assigned.
  if (driver.status !== 'Available') {
    throw new ApiError(422, `Driver must be Available to dispatch (current: ${driver.status})`);
  }

  // Re-validate cargo weight in case the vehicle changed since trip creation.
  if (trip.cargoWeight > vehicle.maxLoadCapacity) {
    throw new ApiError(
      422,
      `Cargo weight (${trip.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`
    );
  }

  trip.status = 'Dispatched';
  trip.dispatchedAt = new Date();
  vehicle.status = 'On Trip';
  driver.status = 'On Trip';

  await Promise.all([trip.save(), vehicle.save(), driver.save()]);

  res.status(200).json({ success: true, data: trip });
});

// @route  POST /api/trips/:id/complete
// @access Private (fleet_manager, driver)
// Body: { finalOdometer, fuelConsumed, fuelCost }
const completeTrip = asyncHandler(async (req, res) => {
  const { finalOdometer, fuelConsumed, fuelCost, revenue } = req.body;

  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (trip.status !== 'Dispatched') {
    throw new ApiError(409, `Only Dispatched trips can be completed (current status: ${trip.status})`);
  }

  const vehicle = await Vehicle.findById(trip.vehicle);
  const driver = await Driver.findById(trip.driver);

  trip.status = 'Completed';
  trip.completedAt = new Date();
  if (finalOdometer != null) trip.finalOdometer = finalOdometer;
  if (fuelConsumed != null) trip.fuelConsumed = fuelConsumed;
  if (revenue != null) trip.revenue = revenue;

  // Completing a trip automatically changes both vehicle and driver back to Available.
  if (vehicle) {
    if (finalOdometer != null && finalOdometer >= vehicle.odometer) {
      vehicle.odometer = finalOdometer;
    }
    vehicle.status = 'Available';
    await vehicle.save();
  }
  if (driver) {
    driver.status = 'Available';
    await driver.save();
  }

  await trip.save();

  // Optionally log fuel consumption against the vehicle for reporting.
  if (fuelConsumed != null && fuelCost != null) {
    await FuelLog.create({
      vehicle: trip.vehicle,
      trip: trip._id,
      liters: fuelConsumed,
      cost: fuelCost,
      date: new Date(),
      createdBy: req.user._id,
    });
  }

  res.status(200).json({ success: true, data: trip });
});

// @route  POST /api/trips/:id/cancel
// @access Private (fleet_manager, driver)
const cancelTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) throw new ApiError(404, 'Trip not found');
  if (!['Draft', 'Dispatched'].includes(trip.status)) {
    throw new ApiError(409, `Trip in status ${trip.status} cannot be cancelled`);
  }

  const wasDispatched = trip.status === 'Dispatched';
  trip.status = 'Cancelled';
  trip.cancelledAt = new Date();
  await trip.save();

  // Cancelling a dispatched trip restores vehicle and driver to Available.
  if (wasDispatched) {
    const vehicle = await Vehicle.findById(trip.vehicle);
    const driver = await Driver.findById(trip.driver);
    if (vehicle && vehicle.status === 'On Trip') {
      vehicle.status = 'Available';
      await vehicle.save();
    }
    if (driver && driver.status === 'On Trip') {
      driver.status = 'Available';
      await driver.save();
    }
  }

  res.status(200).json({ success: true, data: trip });
});

module.exports = { getTrips, getTrip, createTrip, updateTrip, dispatchTrip, completeTrip, cancelTrip };
