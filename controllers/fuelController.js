const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const FuelLog = require('../models/Fuel');
const Vehicle = require('../models/Vehicle');

// @route  GET /api/fuel
// Supports ?vehicle=&from=&to=
const getFuelLogs = asyncHandler(async (req, res) => {
  const { vehicle, from, to } = req.query;
  const filter = {};
  if (vehicle) filter.vehicle = vehicle;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const logs = await FuelLog.find(filter)
    .populate('vehicle', 'registrationNumber name')
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: logs.length, data: logs });
});

// @route  POST /api/fuel
// @access Private (fleet_manager, driver, financial_analyst)
const createFuelLog = asyncHandler(async (req, res) => {
  const { vehicle, liters, cost, date, trip } = req.body;

  if (!vehicle || liters == null || cost == null) {
    throw new ApiError(400, 'vehicle, liters and cost are required');
  }

  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) throw new ApiError(404, 'Vehicle not found');

  const log = await FuelLog.create({
    vehicle,
    trip: trip || null,
    liters,
    cost,
    date: date || Date.now(),
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: log });
});

module.exports = { getFuelLogs, createFuelLog };
