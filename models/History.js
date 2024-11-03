const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['VENUE', 'USER', 'BOOKING', 'SETTING'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  adminId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    before: Object,
    after: Object
  },
  metadata: {
    ip: String,
    userAgent: String,
    browser: String
  },
  description: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', historySchema); 