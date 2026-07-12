const express = require('express');
const { getFuelLogs, createFuelLog } = require('../controllers/fuelController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getFuelLogs);
router.post('/', authorize('fleet_manager', 'driver', 'financial_analyst'), createFuelLog);

module.exports = router;
