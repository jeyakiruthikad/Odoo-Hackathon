const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const MaintenanceLog = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');

// @route  GET /api/maintenance
// Supports ?vehicle=&isClosed=
const getMaintenanceLogs = asyncHandler(async (req, res) => {
  const { vehicle, isClosed } = req.query;
  const filter = {};
  if (vehicle) filter.vehicle = vehicle;
  if (isClosed !== undefined) filter.isClosed = isClosed === 'true';

  const logs = await MaintenanceLog.find(filter)
    .populate('vehicle', 'registrationNumber name status')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: logs.length, data: logs });
});

// @route  POST /api/maintenance
// @access Private (fleet_manager)
// Creating an active maintenance record automatically changes vehicle status to In Shop,
// which removes it from the dispatch/driver selection pool.
const createMaintenanceLog = asyncHandler(async (req, res) => {
  const { vehicle, description, cost, startDate, notes } = req.body;

  if (!vehicle || !description) {
    throw new ApiError(400, 'vehicle and description are required');
  }

  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) throw new ApiError(404, 'Vehicle not found');

  if (vehicleDoc.status === 'On Trip') {
    throw new ApiError(409, 'Vehicle is currently on a trip and cannot be sent for maintenance');
  }
  if (vehicleDoc.status === 'Retired') {
    throw new ApiError(409, 'Retired vehicles cannot have new maintenance logs');
  }

  const log = await MaintenanceLog.create({
    vehicle,
    description,
    cost: cost || 0,
    startDate: startDate || Date.now(),
    notes,
    createdBy: req.user._id,
  });

  vehicleDoc.status = 'In Shop';
  await vehicleDoc.save();

  res.status(201).json({ success: true, data: log });
});

// @route  PUT /api/maintenance/:id/close
// @access Private (fleet_manager)
// Closing maintenance restores the vehicle to Available, unless it has been retired.
const closeMaintenanceLog = asyncHandler(async (req, res) => {
  const log = await MaintenanceLog.findById(req.params.id);
  if (!log) throw new ApiError(404, 'Maintenance log not found');
  if (log.isClosed) throw new ApiError(409, 'Maintenance log is already closed');

  log.isClosed = true;
  log.closedDate = new Date();
  if (req.body.cost != null) log.cost = req.body.cost;
  await log.save();

  const vehicle = await Vehicle.findById(log.vehicle);
  if (vehicle && vehicle.status !== 'Retired') {
    // Only flip back to Available if no other open maintenance logs remain.
    const otherOpenLogs = await MaintenanceLog.countDocuments({
      vehicle: vehicle._id,
      isClosed: false,
      _id: { $ne: log._id },
    });
    if (otherOpenLogs === 0) {
      vehicle.status = 'Available';
      await vehicle.save();
    }
  }

  res.status(200).json({ success: true, data: log });
});

module.exports = { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog };
