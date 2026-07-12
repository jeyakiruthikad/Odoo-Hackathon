const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');

// @route  GET /api/vehicles
// @access Private (all authenticated roles)
// Supports ?status=&type=&region=&dispatchable=true
const getVehicles = asyncHandler(async (req, res) => {
  const { status, type, region, dispatchable } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (region) filter.region = region;

  // Convenience filter for building a driver's dispatch selection pool -
  // Retired or In Shop vehicles must never appear in the dispatch selection.
  if (dispatchable === 'true') {
    filter.status = 'Available';
  }

  const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
});

// @route  GET /api/vehicles/:id
const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');
  res.status(200).json({ success: true, data: vehicle });
});

// @route  POST /api/vehicles
// @access Private (fleet_manager)
const createVehicle = asyncHandler(async (req, res) => {
  const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, region } =
    req.body;

  if (!registrationNumber || !name || !type || maxLoadCapacity == null || acquisitionCost == null) {
    throw new ApiError(
      400,
      'registrationNumber, name, type, maxLoadCapacity and acquisitionCost are required'
    );
  }

  // Explicit uniqueness check for a friendlier error than the raw duplicate-key error
  const existing = await Vehicle.findOne({
    registrationNumber: registrationNumber.trim().toUpperCase(),
  });
  if (existing) {
    throw new ApiError(409, `Registration number '${registrationNumber}' is already in use`);
  }

  const vehicle = await Vehicle.create({
    registrationNumber,
    name,
    type,
    maxLoadCapacity,
    odometer: odometer || 0,
    acquisitionCost,
    region,
  });

  res.status(201).json({ success: true, data: vehicle });
});

// @route  PUT /api/vehicles/:id
// @access Private (fleet_manager)
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  // Prevent manually moving a vehicle to a status that conflicts with an active trip
  if (req.body.status && req.body.status !== vehicle.status) {
    const activeTrip = await Trip.findOne({ vehicle: vehicle._id, status: 'Dispatched' });
    if (activeTrip && req.body.status !== 'On Trip') {
      throw new ApiError(
        409,
        'Vehicle has a dispatched trip in progress and cannot change status manually'
      );
    }
  }

  if (req.body.registrationNumber) {
    req.body.registrationNumber = req.body.registrationNumber.trim().toUpperCase();
  }

  Object.assign(vehicle, req.body);
  await vehicle.save();

  res.status(200).json({ success: true, data: vehicle });
});

// @route  DELETE /api/vehicles/:id
// @access Private (fleet_manager)
const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw new ApiError(404, 'Vehicle not found');

  const activeTrip = await Trip.findOne({
    vehicle: vehicle._id,
    status: { $in: ['Draft', 'Dispatched'] },
  });
  if (activeTrip) {
    throw new ApiError(409, 'Cannot delete a vehicle with an active or draft trip');
  }

  await vehicle.deleteOne();
  res.status(200).json({ success: true, message: 'Vehicle deleted' });
});

module.exports = { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle };
