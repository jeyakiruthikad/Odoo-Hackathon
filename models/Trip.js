const mongoose = require('mongoose');

const TRIP_STATUS = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

const tripSchema = new mongoose.Schema(
  {
    source: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargoWeight: { type: Number, required: true, min: 0 }, // kg
    distance: { type: Number, required: true, min: 0 }, // planned distance km
    status: { type: String, enum: TRIP_STATUS, default: 'Draft' },

    dispatchedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    // Filled in on completion
    finalOdometer: { type: Number, default: null },
    fuelConsumed: { type: Number, default: null }, // liters
    // Revenue earned from this trip. The spec's Vehicle ROI formula needs a
    // revenue figure but the source doc doesn't define where it comes from,
    // so we capture it optionally at trip completion (e.g. freight charge billed).
    revenue: { type: Number, default: 0, min: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
module.exports.TRIP_STATUS = TRIP_STATUS;
