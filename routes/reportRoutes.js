const express = require('express');
const { getFleetReport, exportFleetReportCsv } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/fleet', authorize('fleet_manager', 'financial_analyst', 'safety_officer'), getFleetReport);
router.get(
  '/fleet/export',
  authorize('fleet_manager', 'financial_analyst'),
  exportFleetReportCsv
);

module.exports = router;
