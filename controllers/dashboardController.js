const asyncHandler = require('../utils/asyncHandler');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

// @route  GET /api/dashboard
// Supports ?type=&region= to filter the underlying vehicle set for KPIs
// @access Private (all authenticated roles)
const getDashboard = asyncHandler(async (req, res) => {
  const { type, region } = req.query;
  const vehicleFilter = {};
  if (type) vehicleFilter.type = type;
  if (region) vehicleFilter.region = region;

  const [
    totalVehicles,
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    totalDrivers,
    recentTrips,
  ] = await Promise.all([
    Vehicle.countDocuments(vehicleFilter),
    Vehicle.countDocuments({ ...vehicleFilter, status: { $in: ['Available', 'On Trip'] } }),
    Vehicle.countDocuments({ ...vehicleFilter, status: 'Available' }),
    Vehicle.countDocuments({ ...vehicleFilter, status: 'In Shop' }),
    Vehicle.countDocuments({ ...vehicleFilter, status: 'Retired' }),
    Trip.countDocuments({ status: 'Dispatched' }),
    Trip.countDocuments({ status: 'Draft' }),
    Driver.countDocuments({ status: 'On Trip' }),
    Driver.countDocuments({}),
    Trip.find({})
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('vehicle', 'registrationNumber name')
      .populate('driver', 'name'),
  ]);

  // Fleet Utilization (%) = vehicles currently On Trip / total non-retired vehicles
  const onTripVehicles = await Vehicle.countDocuments({ ...vehicleFilter, status: 'On Trip' });
  const nonRetired = totalVehicles - retiredVehicles;
  const fleetUtilization = nonRetired > 0 ? Number(((onTripVehicles / nonRetired) * 100).toFixed(1)) : 0;

  res.status(200).json({
    success: true,
    data: {
      kpis: {
        totalVehicles,
        activeVehicles,
        availableVehicles,
        vehiclesInMaintenance,
        retiredVehicles,
        activeTrips,
        pendingTrips,
        driversOnDuty,
        totalDrivers,
        fleetUtilization,
      },
      recentActivity: recentTrips,
    },
  });
});

module.exports = { getDashboard };
