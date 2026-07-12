const mongoose = require('mongoose');

const fuelSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null },
    liters: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FuelLog', fuelSchema);
