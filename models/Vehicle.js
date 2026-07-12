const mongoose = require('mongoose');

const VEHICLE_STATUS = ['Available', 'On Trip', 'In Shop', 'Retired'];

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: true, trim: true }, // Vehicle Name/Model
    type: { type: String, required: true, trim: true }, // e.g. Truck, Van, Bike
    maxLoadCapacity: { type: Number, required: true, min: 0 }, // kg
    odometer: { type: Number, required: true, min: 0, default: 0 }, // km
    acquisitionCost: { type: Number, required: true, min: 0 },
    status: { type: String, enum: VEHICLE_STATUS, default: 'Available' },
    region: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
module.exports.VEHICLE_STATUS = VEHICLE_STATUS;
