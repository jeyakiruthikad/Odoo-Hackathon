const express = require('express');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getDrivers);
router.get('/:id', getDriver);
router.post('/', authorize('fleet_manager', 'safety_officer'), createDriver);
router.put('/:id', authorize('fleet_manager', 'safety_officer'), updateDriver);
router.delete('/:id', authorize('fleet_manager'), deleteDriver);

module.exports = router;
