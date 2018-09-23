const express = require('express');
const authenticate = require('../middlewares/authenticate');
const userCtrl = require('./user.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/me')
  /** GET /api/users - Get list of users */
  .get(authenticate, userCtrl.load)

module.exports = router;
