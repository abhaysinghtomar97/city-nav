const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: [true, 'City reference is required']
  },
  type: {
    type: String,
    enum: ['landmark', 'station', 'area', 'airport', 'hospital', 'market', 'educational', 'residential', 'other'],
    default: 'area'
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  aliases: {
    type: [String],
    default: []
  },
  isMetroStation: {
    type: Boolean,
    default: false
  },
  metroline: {
    type: String,
    default: null
  },
  isBusStop: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

locationSchema.index({ name: 'text', aliases: 'text' });
locationSchema.index({ city: 1 });
locationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', locationSchema);