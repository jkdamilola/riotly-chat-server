const ChatRoom = require('./chatroom.model');
const Message = require('./message.model');
/* const userCtrl = require('../user/user.controller');
const APIError = require('../helpers/APIError');
const config = require('../../config/config'); */

/**
 * Returns jwt token and user object
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function createChatRoom(req, res, next) {
  const owner = req.decoded.userId;
  const topic = req.body.data.topic;

  const chatroom = new ChatRoom({
    owner,
    topic,
  });

  chatroom
    .save()
    .then(newChatRoom => {
      return ChatRoom.get(newChatRoom._id);
    })
    .then(newChatRoom => {
      const response = {
        success: true,
        message: 'Chat room created successffully',
        chatroom: newChatRoom,
      }

      res.io.emit('new-chatroom', response);
      res.json(response);
    })
    .catch(err => {
      res.json({
        success: false,
        message: err.message,
      });
      next(err);
    });
}

function joinChatRoom(req, res, next) {
  const memberId = req.decoded.userId;
  const chatroomId = req.params.roomId;

  ChatRoom.get(chatroomId)
    .then(chatroom => {
      if (!chatroom) {
        return res.json({
          success: false,
          message: 'Chat room doesn\'t exist',
        });
      }

      const isOwner = chatroom.owner._id.toString() === memberId;
      const isMember = chatroom.members.some(member => member._id.toString() === memberId);

      if (isOwner || isMember) {
        return res.json({
          success: false,
          message: 'You are already a member of this chat room',
        });
      }

      return ChatRoom.findOneAndUpdate({
        _id: chatroomId,
      }, {
        $push: { members: memberId },
      }, {
        new: true,
      })
      .populate({ path: 'owner', select: 'name email picture' })
      .populate({ path: 'members', select: 'name email picture' })
      .lean()
      .exec();
    })
    .then(chatroom => {
      const response = sendMessage(memberId, chatroomId, {
        message: ' joined',
        status: true,
      });

      return Promise.all([chatroom, response]);
    })
    .then(([chatroom, response]) => {
      const data = {
        success: response.success,
        message: response.message,
        chatroom,
      }

      res.io.to(chatroomId).emit('new-message', data);
      res.json(data);
    });
}

function leaveChatRoom(req, res, next) {
  const memberId = req.decoded.userId;
  const chatroomId = req.params.roomId;

  return ChatRoom.get(chatroomId)
    .then((chatroom) => {
      if (!chatroom) {
        return res.json({
          success: false,
          message: 'Chatroom does not exist',
        });
      }

      const isOwner = chatroom.owner._id.toString() === memberId;
      const isMember = chatroom.members.some(member => member._id.toString() === memberId);

      if (isOwner) {
        return res.json({
          success: false,
          message: 'You can only delete your chatroom',
        });
      }

      if (!isMember) {
        return res.json({
          success: false,
          message: 'You are not a member of this chatroom',
        });
      }

      return ChatRoom.findByIdAndUpdate(
        chatroomId,
        {
          $pull: { members: memberId },
        },
        {
          new: true,
        },
      )
      .populate({ path: 'owner', select: 'name email picture' })
      .populate({ path: 'members', select: 'name email picture' })
      .lean()
      .exec();
    })
    .then(chatroom => {
      const response = sendMessage(memberId, chatroomId, {
        message: ' left',
        status: true,
      });

      return Promise.all([chatroom, response]);
    })
    .then(([chatroom, response]) => {
      const data = {
        success: response.success,
        message: response.message,
        chatroom,
      }

      res.io.to(chatroomId).emit('new-message', data);
      res.json(data);
    });
}

function deleteChatRoom(req, res, next) {
  const memberId = req.decoded.userId;
  const chatroomId = req.params.roomId;

  return ChatRoom.getOne({
    owner: memberId,
    _id: chatroomId,
  })
  .then((chatroom) => {
    if (!chatroom) {
      return res.json({
        success: false,
        message: 'Chatroom does not exist',
      });
    }

    return ChatRoom.findByIdAndRemove(chatroomId).exec();
  })
  .then(() => {
    const response = {
      success: true,
      message: 'Chatroom deleted!',
      chatroom: {
        _id: chatroomId,
      },
    };

    res.io.emit('deleted-chatroom', response);
    res.json(response);
  });
}

function listChatRooms(req, res, next) {
  ChatRoom.list().then(chatrooms => {
    res.json({
      success: true,
      chatrooms,
    });
  }).catch(err => {
    res.json({
      success: false,
      message: err.message,
    });
    next(err);
  });
}

function getMyChatRooms(req, res, next) {
  const owner = req.decoded.userId;
  ChatRoom.list({
    $or: [{ owner }, { members: owner }],
  }). then(chatrooms => {
    res.json({
      success: true,
      chatrooms,
    });
  }).catch(err => {
    res.json({
      success: false,
      message: err.message,
    });
    next(err);
  });
}

function getChatRoom(req, res, next) {
  const chatroomId = req.params.roomId;
  Promise.all([
    ChatRoom.get(chatroomId),
    Message.list({ chatroomId }),
  ]).then(([chatroom, messages]) => {
    if (!chatroom) {
      return res.json({
        success: false,
        message: 'Chatroom not found',
      });
    }
    res.json({
      success: true,
      chatroom,
      messages,
    });
  }).catch(err => {
    res.json({
      success: false,
      message: err.message,
    });
    next(err);
  });
}

function sendMessage(sender, chatroomId, data) {
  const message = new Message(Object.assign({}, data, {
    sender,
    chatroomId,
  }));

  return message
    .save()
    .then(savedMessage => 
      Message.findById(savedMessage._id)
        .populate({ path: 'sender', select: 'name email picture' })
        .exec())
    .then(savedMessage =>
      Promise.resolve({
        success: true,
        message: savedMessage,
      }));
}

function getAllMessages(chatroomId) {
  return Message.list({ chatroomId })
    .then(messages =>
      Promise.resolve({
        success: true,
        messages,
      }));
}

module.exports = { createChatRoom, joinChatRoom, leaveChatRoom, deleteChatRoom, listChatRooms, getMyChatRooms, getChatRoom, sendMessage, getAllMessages };