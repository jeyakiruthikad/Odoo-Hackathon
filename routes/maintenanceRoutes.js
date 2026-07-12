const express = require('express');
const {
  getMaintenanceLogs,
  createMaintenanceLog,
  closeMaintenanceLog,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMaintenanceLogs);
router.post('/', authorize('fleet_manager'), createMaintenanceLog);
router.put('/:id/close', authorize('fleet_manager'), closeMaintenanceLog);

module.exports = router;
