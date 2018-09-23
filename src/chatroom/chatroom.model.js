const Promise = require('bluebird');
const mongoose = require('mongoose');
const APIError = require('../helpers/APIError');

/**
 * User Schema
 */
const ChatRoomSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  topic: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

/**
 * Statics
 */
ChatRoomSchema.statics = {
  /**
   * Get chat
   * @param {ObjectId} id - The objectId of chat.
   * @returns {Promise<ChatRoom, APIError>}
   */
  get(chatId) {
    return this.findById(chatId)
      .populate({ path: 'owner', select: 'name email picture' })
      .populate({ path: 'members', select: 'name email picture' })
      .lean()
      .exec();
  },

  /**
   * Get one chat
   * @param {Object} query - The search query.
   * @returns {Promise<ChatRoom, APIError>}
   */
  getOne(query) {
    return this.findOne(query)
      .populate({ path: 'owner', select: 'name email picture' })
      .populate({ path: 'members', select: 'name email picture' })
      .lean()
      .exec();
  },

  /**
   * List chat
   * @param {Object} query - The search query.
   * @returns {Promise<ChatRoom[]>}
   */
  list(query = {}) {
    return this.find(query)
      .populate({ path: 'owner', select: 'name email picture' })
      .populate({ path: 'members', select: 'name email picture' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
};

/**
 * @typedef ChatRoom
 */
module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
