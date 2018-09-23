const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const APIError = require('../helpers/APIError');
const { jwtSecret} = require('../../config/config');

const { sendMessage } = require('../chatroom/chatroom.controller');

// Socket.IO Middleware for Auth
function socketAuth(socket, next) {
  const { token } = socket.handshake.query;
  console.log('socketAuth', token);

  if (!token) {
    return next(new APIError('Failed to authenticate socket', httpStatus.UNAUTHORIZED, true));
  }

  return jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return next(new APIError('Failed to authenticate socket', httpStatus.UNAUTHORIZED, true));
    }

    // eslint-disable-next-line
    socket.decoded = decoded;
    return next();
  });
}

function socketIO(io) {
  console.log('socketIOOOO', io);
  io.use(socketAuth);

  io.on('connection', (socket) => {
    socket.on('mount-chatroom', (chatroomId) => socket.join(chatroomId));

    socket.on('unmount-chatroom', (chatroomId) => socket.leave(chatroomId));

    socket.on('send-message', (newMessage) => {
      const { roomId, content } = newMessage;

      return sendMessage(socket.decoded.userId, roomId, { message: content })
        .then(({ success, message }) => {
          io.to(roomId).emit('new-message', {
            success,
            message,
          });
        })
        .catch((error) => {
          // Handle errors
          // eslint-disable-next-line
          console.log(error);
        });
    });
  });

  return (req, res, next) => {
    res.io = io;
    next();
  };
}

module.exports = socketIO;