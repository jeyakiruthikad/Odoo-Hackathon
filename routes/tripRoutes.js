const express = require('express');
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} = require('../controllers/tripController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getTrips);
router.get('/:id', getTrip);
router.post('/', authorize('fleet_manager', 'driver'), createTrip);
router.put('/:id', authorize('fleet_manager', 'driver'), updateTrip);
router.post('/:id/dispatch', authorize('fleet_manager', 'driver'), dispatchTrip);
router.post('/:id/complete', authorize('fleet_manager', 'driver'), completeTrip);
router.post('/:id/cancel', authorize('fleet_manager', 'driver'), cancelTrip);

module.exports = router;
