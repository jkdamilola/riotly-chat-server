const mongoose = require('mongoose');

const ignoreEmpty = val => (val !== '' ? val : undefined);

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    set: ignoreEmpty,
  },
  chatroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
  },
  message: String,
  status: {
    type: Boolean,
    default: false,
  } 
}, { 
  timestamps: true,
});

/**
 * Statics
 */
MessageSchema.statics = {
  /**
   * List messages
   * @param {Object} query - The search query.
   * @returns {Promise<Message[]>}
   */
  list(query = {}) {
    return this.find(query)
      .populate({ path: 'sender', select: 'name email picture' })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }
};

module.exports = mongoose.model('Message', MessageSchema);