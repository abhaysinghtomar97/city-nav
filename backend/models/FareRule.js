const mongoose = require('mongoose');

const fareRuleSchema = new mongoose.Schema({
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['bus', 'auto', 'taxi', 'metro'],
    required: [true, 'Vehicle type is required']
  },
  baseFare: {
    type: Number,
    required: [true, 'Base fare is required'],
    min: 0,
    default: 0
  },
  minimumFare: {
    type: Number,
    required: [true, 'Minimum fare is required'],
    min: 0
  },
  perKmRate: {
    type: Number,
    required: [true, 'Per km rate is required'],
    min: 0
  },
  // Night surcharge multiplier (e.g. 1.25 = 25% extra)
  nightSurchargeMultiplier: {
    type: Number,
    default: 1.0,
    min: 1.0
  },
  nightStartHour: {
    type: Number,
    default: 23,
    min: 0,
    max: 23
  },
  nightEndHour: {
    type: Number,
    default: 6,
    min: 0,
    max: 23
  },
  // Per minute waiting charge
  waitingChargePerMin: {
    type: Number,
    default: 0
  },
  // Flat rate for specific distance slabs (optional complexity)
  slabs: [{
    upToKm: Number,
    ratePerKm: Number
  }],
  currency: {
    type: String,
    default: 'INR'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 300
  }
}, { timestamps: true });

fareRuleSchema.index({ city: 1, vehicleType: 1 }, { unique: true });

module.exports = mongoose.model('FareRule', fareRuleSchema);