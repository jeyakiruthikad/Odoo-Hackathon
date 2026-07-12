const mongoose = require('mongoose');

const DRIVER_STATUS = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    licenseCategory: { type: String, required: true, trim: true },
    licenseExpiry: { type: Date, required: true },
    contactNumber: { type: String, required: true, trim: true },
    safetyScore: { type: Number, min: 0, max: 100, default: 100 },
    status: { type: String, enum: DRIVER_STATUS, default: 'Available' },
    // Optional link back to the login account
    userAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Virtual helper - is license currently expired
driverSchema.virtual('isLicenseExpired').get(function isLicenseExpired() {
  return this.licenseExpiry < new Date();
});

module.exports = mongoose.model('Driver', driverSchema);
module.exports.DRIVER_STATUS = DRIVER_STATUS;
