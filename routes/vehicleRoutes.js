const express = require('express');
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', authorize('fleet_manager'), createVehicle);
router.put('/:id', authorize('fleet_manager'), updateVehicle);
router.delete('/:id', authorize('fleet_manager'), deleteVehicle);

module.exports = router;
