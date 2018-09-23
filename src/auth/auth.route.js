const express = require('express');
const expressJwt = require('express-jwt');
const authCtrl = require('./auth.controller');
const config = require('../../config/config');
const passport = require('passport');
require('./passport')();

const router = express.Router(); // eslint-disable-line new-cap

/** POST /api/auth/login - Returns token if correct google login provided */
router.route('/google-login')
  .post(passport.authenticate('google-token', {
    session: false,
    scope: ['profile', 'email'],
}), authCtrl.login);

module.exports = router;
