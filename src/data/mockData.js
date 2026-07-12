export const ROLES = {
  FLEET_MANAGER: 'Fleet Manager',
  DRIVER: 'Driver',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
}

export const DEMO_USERS = [
  { id: 'u1', name: 'Priya Nair', email: 'fleet@transitops.io', password: 'demo1234', role: ROLES.FLEET_MANAGER },
  { id: 'u2', name: 'Alex Menon', email: 'driver@transitops.io', password: 'demo1234', role: ROLES.DRIVER },
  { id: 'u3', name: 'Sara Kutty', email: 'safety@transitops.io', password: 'demo1234', role: ROLES.SAFETY_OFFICER },
  { id: 'u4', name: 'Vikram Rao', email: 'finance@transitops.io', password: 'demo1234', role: ROLES.FINANCIAL_ANALYST },
]

export const VEHICLE_STATUS = ['Available', 'On Trip', 'In Shop', 'Retired']
export const DRIVER_STATUS = ['Available', 'On Trip', 'Off Duty', 'Suspended']
export const TRIP_STATUS = ['Draft', 'Dispatched', 'Completed', 'Cancelled']

export const seedVehicles = [
  { id: 'v1', regNumber: 'TN-07-AX-2201', name: 'Van-05', type: 'Van', maxLoadKg: 500, odometer: 34210, acquisitionCost: 1450000, status: 'Available', region: 'Chennai' },
  { id: 'v2', regNumber: 'TN-09-BZ-1187', name: 'Truck-12', type: 'Truck', maxLoadKg: 3000, odometer: 88120, acquisitionCost: 3200000, status: 'On Trip', region: 'Coimbatore' },
  { id: 'v3', regNumber: 'TN-01-CJ-0456', name: 'Mini-03', type: 'Mini Truck', maxLoadKg: 1000, odometer: 51200, acquisitionCost: 980000, status: 'In Shop', region: 'Chennai' },
  { id: 'v4', regNumber: 'TN-22-DK-3390', name: 'Van-08', type: 'Van', maxLoadKg: 500, odometer: 12040, acquisitionCost: 1500000, status: 'Available', region: 'Madurai' },
  { id: 'v5', regNumber: 'TN-14-EE-7712', name: 'Truck-02', type: 'Truck', maxLoadKg: 2500, odometer: 121980, acquisitionCost: 2900000, status: 'Retired', region: 'Coimbatore' },
]

export const seedDrivers = [
  { id: 'd1', name: 'Alex Menon', licenseNumber: 'TN0420210004521', licenseCategory: 'LMV', licenseExpiry: '2027-03-14', contact: '+91 98400 11223', safetyScore: 92, status: 'Available' },
  { id: 'd2', name: 'Rahul Dev', licenseNumber: 'TN0620190017788', licenseCategory: 'HMV', licenseExpiry: '2026-01-05', contact: '+91 98650 44120', safetyScore: 78, status: 'On Trip' },
  { id: 'd3', name: 'Farah Sheikh', licenseNumber: 'TN0120220098123', licenseCategory: 'HMV', licenseExpiry: '2025-11-30', contact: '+91 90031 22110', safetyScore: 65, status: 'Available' },
  { id: 'd4', name: 'Manoj Iyer', licenseNumber: 'TN0920180056432', licenseCategory: 'LMV', licenseExpiry: '2026-09-21', contact: '+91 89401 55667', safetyScore: 40, status: 'Suspended' },
]

export const seedTrips = [
  { id: 't1', source: 'Chennai DC', destination: 'Coimbatore Hub', vehicleId: 'v2', driverId: 'd2', cargoWeightKg: 2200, distanceKm: 505, status: 'Dispatched', createdAt: '2026-07-10' },
  { id: 't2', source: 'Chennai DC', destination: 'Pondicherry Depot', vehicleId: 'v1', driverId: 'd1', cargoWeightKg: 450, distanceKm: 160, status: 'Completed', createdAt: '2026-07-08', finalOdometer: 34210, fuelConsumedL: 14.2 },
  { id: 't3', source: 'Madurai DC', destination: 'Trichy Depot', vehicleId: 'v4', driverId: 'd3', cargoWeightKg: 300, distanceKm: 135, status: 'Draft', createdAt: '2026-07-11' },
]

export const seedMaintenance = [
  { id: 'm1', vehicleId: 'v3', type: 'Oil Change', description: 'Scheduled oil + filter change', cost: 4200, date: '2026-07-09', status: 'Active' },
  { id: 'm2', vehicleId: 'v2', type: 'Tyre Replacement', description: 'Rear tyre wear replacement', cost: 18500, date: '2026-06-20', status: 'Closed' },
]

export const seedFuelLogs = [
  { id: 'f1', vehicleId: 'v1', liters: 14.2, cost: 1560, date: '2026-07-08' },
  { id: 'f2', vehicleId: 'v2', liters: 210, cost: 22800, date: '2026-07-10' },
  { id: 'f3', vehicleId: 'v4', liters: 9.5, cost: 1045, date: '2026-07-05' },
]

export const seedExpenses = [
  { id: 'e1', vehicleId: 'v2', category: 'Toll', amount: 1850, date: '2026-07-10', note: 'NH44 toll plazas' },
  { id: 'e2', vehicleId: 'v1', category: 'Toll', amount: 220, date: '2026-07-08', note: 'ECR toll' },
  { id: 'e3', vehicleId: 'v3', category: 'Maintenance', amount: 4200, date: '2026-07-09', note: 'Oil change (linked)' },
]

// Revenue is not modeled in the spec's entities, so we derive a simple demo
// revenue per trip for ROI reporting purposes (distance-based tariff).
export const REVENUE_PER_KM = 45
