const mongoose = require('mongoose');

const routeEdgeSchema = new mongoose.Schema({
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  distanceKm: {
    type: Number,
    required: [true, 'Distance in km is required'],
    min: 0
  },
  // Base travel time in minutes without traffic
  durationMinutes: {
    type: Number,
    required: [true, 'Duration in minutes is required'],
    min: 0
  },
  supportedVehicles: {
    type: [String],
    enum: ['bus', 'auto', 'taxi', 'metro'],
    default: ['bus', 'auto', 'taxi']
  },
  isMetroRoute: {
    type: Boolean,
    default: false
  },
  // Bidirectional edge
  isBidirectional: {
    type: Boolean,
    default: true
  },
  roadType: {
    type: String,
    enum: ['highway', 'main_road', 'inner_road', 'metro_line'],
    default: 'main_road'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

routeEdgeSchema.index({ city: 1 });
routeEdgeSchema.index({ from: 1, to: 1 });

module.exports = mongoose.model('RouteEdge', routeEdgeSchema);