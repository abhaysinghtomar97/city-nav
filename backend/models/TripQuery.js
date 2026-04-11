const mongoose = require('mongoose');

const tripQuerySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null = guest user
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  source: {
    name: { type: String, required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  destination: {
    name: { type: String, required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  vehicleType: {
    type: String,
    enum: ['bus', 'auto', 'taxi', 'metro', 'all'],
    required: true
  },
  result: {
    totalDistanceKm: Number,
    estimatedDurationMin: Number,
    estimatedFare: Number,
    fareBreakdown: {
      baseFare: Number,
      distanceCharge: Number,
      surcharges: Number,
      total: Number
    },
    routePath: [String],
    steps: [{ instruction: String, distanceKm: Number, durationMin: Number }],
    alternativeRoutes: Number
  },
  sessionId: { // For guest users
    type: String,
    default: null
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  ipAddress: {
    type: String,
    select: false
  },
  queryDurationMs: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

tripQuerySchema.index({ user: 1, createdAt: -1 });
tripQuerySchema.index({ city: 1, createdAt: -1 });
tripQuerySchema.index({ sessionId: 1 });

module.exports = mongoose.model('TripQuery', tripQuerySchema);