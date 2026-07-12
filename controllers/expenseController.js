const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Expense = require('../models/Expense');
const Vehicle = require('../models/Vehicle');

// @route  GET /api/expenses
// Supports ?vehicle=&type=&from=&to=
const getExpenses = asyncHandler(async (req, res) => {
  const { vehicle, type, from, to } = req.query;
  const filter = {};
  if (vehicle) filter.vehicle = vehicle;
  if (type) filter.type = type;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const expenses = await Expense.find(filter)
    .populate('vehicle', 'registrationNumber name')
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: expenses.length, data: expenses });
});

// @route  POST /api/expenses
// @access Private (fleet_manager, financial_analyst)
const createExpense = asyncHandler(async (req, res) => {
  const { vehicle, type, amount, date, notes, trip } = req.body;

  if (!vehicle || !type || amount == null) {
    throw new ApiError(400, 'vehicle, type and amount are required');
  }

  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) throw new ApiError(404, 'Vehicle not found');

  const expense = await Expense.create({
    vehicle,
    trip: trip || null,
    type,
    amount,
    date: date || Date.now(),
    notes,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: expense });
});

module.exports = { getExpenses, createExpense };
