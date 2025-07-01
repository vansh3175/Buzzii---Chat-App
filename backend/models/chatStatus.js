const mongoose = require('mongoose');

const ChatStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastSeenAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

ChatStatusSchema.index({ userId: 1, chatWith: 1 }, { unique: true });

module.exports = mongoose.model('ChatStatus', ChatStatusSchema);
