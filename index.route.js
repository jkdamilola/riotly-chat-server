const express = require('express');
const userRoutes = require('./src/user/user.route');
const authRoutes = require('./src/auth/auth.route');
const chatroomRoutes = require('./src/chatroom/chatroom.route');

const router = express.Router(); // eslint-disable-line new-cap

// TODO: use glob to match *.route files

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);

// mount user routes at /chats
router.use('/chatrooms', chatroomRoutes);

// mount auth routes at /auth
router.use('/', authRoutes);

module.exports = router;
