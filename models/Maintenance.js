const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    description: { type: String, required: true, trim: true }, // e.g. "Oil Change"
    cost: { type: Number, required: true, min: 0, default: 0 },
    startDate: { type: Date, required: true, default: Date.now },
    closedDate: { type: Date, default: null },
    isClosed: { type: Boolean, default: false },
    notes: { type: String, trim: true, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceLog', maintenanceSchema);
