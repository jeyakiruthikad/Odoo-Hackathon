const asyncHandler = require('../utils/asyncHandler');
const Vehicle = require('../models/Vehicle');
const Trip = require('../models/Trip');
const FuelLog = require('../models/Fuel');
const Expense = require('../models/Expense');
const MaintenanceLog = require('../models/Maintenance');

// Builds a per-vehicle report row combining trips, fuel, expenses and maintenance.
async function buildFleetReport() {
  const vehicles = await Vehicle.find({});

  const [trips, fuelLogs, expenses, maintenanceLogs] = await Promise.all([
    Trip.find({ status: 'Completed' }),
    FuelLog.find({}),
    Expense.find({}),
    MaintenanceLog.find({}),
  ]);

  return vehicles.map((vehicle) => {
    const vId = vehicle._id.toString();

    const vehicleTrips = trips.filter((t) => t.vehicle.toString() === vId);
    const totalDistance = vehicleTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalRevenue = vehicleTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);

    const vehicleFuelLogs = fuelLogs.filter((f) => f.vehicle.toString() === vId);
    const totalFuelLiters = vehicleFuelLogs.reduce((sum, f) => sum + (f.liters || 0), 0);
    const totalFuelCost = vehicleFuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);

    const vehicleExpenses = expenses.filter((e) => e.vehicle.toString() === vId);
    const totalOtherExpenses = vehicleExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const vehicleMaintenance = maintenanceLogs.filter((m) => m.vehicle.toString() === vId);
    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);

    // Fuel Efficiency = Distance / Fuel (km per liter)
    const fuelEfficiency = totalFuelLiters > 0 ? Number((totalDistance / totalFuelLiters).toFixed(2)) : 0;

    // Operational Cost = Fuel + Maintenance (+ other logged expenses)
    const operationalCost = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;

    // Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const roi =
      vehicle.acquisitionCost > 0
        ? Number(
            ((totalRevenue - (totalMaintenanceCost + totalFuelCost)) / vehicle.acquisitionCost).toFixed(4)
          )
        : 0;

    return {
      vehicleId: vId,
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      status: vehicle.status,
      totalTrips: vehicleTrips.length,
      totalDistanceKm: totalDistance,
      totalFuelLiters,
      totalFuelCost,
      totalMaintenanceCost,
      totalOtherExpenses,
      operationalCost,
      totalRevenue,
      fuelEfficiencyKmPerLiter: fuelEfficiency,
      roi,
    };
  });
}

// @route  GET /api/reports/fleet
// @access Private (fleet_manager, financial_analyst, safety_officer)
const getFleetReport = asyncHandler(async (req, res) => {
  const report = await buildFleetReport();

  const totalVehicles = report.length;
  const nonRetired = report.filter((r) => r.status !== 'Retired').length;
  const onTrip = report.filter((r) => r.status === 'On Trip').length;
  const fleetUtilization = nonRetired > 0 ? Number(((onTrip / nonRetired) * 100).toFixed(1)) : 0;

  res.status(200).json({
    success: true,
    data: {
      fleetUtilization,
      totalVehicles,
      vehicles: report,
    },
  });
});

// @route  GET /api/reports/fleet/export
// Streams the same fleet report as a downloadable CSV.
// @access Private (fleet_manager, financial_analyst)
const exportFleetReportCsv = asyncHandler(async (req, res) => {
  const report = await buildFleetReport();

  const headers = [
    'registrationNumber',
    'name',
    'type',
    'status',
    'totalTrips',
    'totalDistanceKm',
    'totalFuelLiters',
    'totalFuelCost',
    'totalMaintenanceCost',
    'totalOtherExpenses',
    'operationalCost',
    'totalRevenue',
    'fuelEfficiencyKmPerLiter',
    'roi',
  ];

  const escapeCsv = (val) => {
    const str = String(val ?? '');
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const rows = report.map((r) => headers.map((h) => escapeCsv(r[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="fleet-report.csv"');
  res.status(200).send(csv);
});

module.exports = { getFleetReport, exportFleetReportCsv };
