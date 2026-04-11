const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true // e.g., "DELETE_USER", "UPDATE_FARE"
  },
  targetType: {
    type: String,
    enum: ['User', 'City', 'Route', 'FareRule'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: Object, // store before/after changes if needed
    default: {}
  },
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);