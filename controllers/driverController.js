const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

// @route  GET /api/drivers
// Supports ?status=&assignable=true
const getDrivers = asyncHandler(async (req, res) => {
  const { status, assignable } = req.query;
  const filter = {};
  if (status) filter.status = status;

  // Convenience filter for building the assignable-driver pool -
  // expired license or Suspended drivers cannot be assigned.
  if (assignable === 'true') {
    filter.status = 'Available';
    filter.licenseExpiry = { $gt: new Date() };
  }

  const drivers = await Driver.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: drivers.length, data: drivers });
});

// @route  GET /api/drivers/:id
const getDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) throw new ApiError(404, 'Driver not found');
  res.status(200).json({ success: true, data: driver });
});

// @route  POST /api/drivers
// @access Private (fleet_manager, safety_officer)
const createDriver = asyncHandler(async (req, res) => {
  const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore } =
    req.body;

  if (!name || !licenseNumber || !licenseCategory || !licenseExpiry || !contactNumber) {
    throw new ApiError(
      400,
      'name, licenseNumber, licenseCategory, licenseExpiry and contactNumber are required'
    );
  }

  const existing = await Driver.findOne({ licenseNumber: licenseNumber.trim() });
  if (existing) {
    throw new ApiError(409, `License number '${licenseNumber}' is already registered`);
  }

  const driver = await Driver.create({
    name,
    licenseNumber,
    licenseCategory,
    licenseExpiry,
    contactNumber,
    safetyScore,
  });

  res.status(201).json({ success: true, data: driver });
});

// @route  PUT /api/drivers/:id
// @access Private (fleet_manager, safety_officer)
const updateDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) throw new ApiError(404, 'Driver not found');

  if (req.body.status && req.body.status !== driver.status) {
    const activeTrip = await Trip.findOne({ driver: driver._id, status: 'Dispatched' });
    if (activeTrip && req.body.status !== 'On Trip') {
      throw new ApiError(
        409,
        'Driver has a dispatched trip in progress and cannot change status manually'
      );
    }
  }

  Object.assign(driver, req.body);
  await driver.save();

  res.status(200).json({ success: true, data: driver });
});

// @route  DELETE /api/drivers/:id
// @access Private (fleet_manager)
const deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) throw new ApiError(404, 'Driver not found');

  const activeTrip = await Trip.findOne({
    driver: driver._id,
    status: { $in: ['Draft', 'Dispatched'] },
  });
  if (activeTrip) {
    throw new ApiError(409, 'Cannot delete a driver with an active or draft trip');
  }

  await driver.deleteOne();
  res.status(200).json({ success: true, message: 'Driver deleted' });
});

module.exports = { getDrivers, getDriver, createDriver, updateDriver, deleteDriver };
