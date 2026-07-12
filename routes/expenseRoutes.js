const express = require('express');
const { getExpenses, createExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getExpenses);
router.post('/', authorize('fleet_manager', 'financial_analyst'), createExpense);

module.exports = router;
