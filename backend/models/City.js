const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'City name is required'],
    unique: true,
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  code: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 6
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  supportedVehicles: {
    type: [String],
    enum: ['bus', 'auto', 'taxi', 'metro'],
    default: ['bus', 'auto', 'taxi']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  imageUrl: {
    type: String,
    default: null
  }
}, { timestamps: true });

citySchema.index({ name: 'text', state: 'text' });

module.exports = mongoose.model('City', citySchema);