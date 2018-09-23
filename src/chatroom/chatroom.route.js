const express = require('express');
const authenticate = require('../middlewares/authenticate');
const chatroomCtrl = require('./chatroom.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/users - Get list of users */
  .get(chatroomCtrl.listChatRooms)

  /** POST /api/users - Create new user */
  .post(authenticate, chatroomCtrl.createChatRoom);

router.route('/my')
  .get(authenticate, chatroomCtrl.getMyChatRooms)

router.route('/:roomId')
  .get(authenticate, chatroomCtrl.getChatRoom)
  .delete(authenticate, chatroomCtrl.deleteChatRoom)

router.route('/:roomId/join')
  .get(authenticate, chatroomCtrl.joinChatRoom)

router.route('/:roomId/leave')
  .get(authenticate, chatroomCtrl.leaveChatRoom);

  module.exports = router;