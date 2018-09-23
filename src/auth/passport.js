const passport = require('passport');
const GoogleTokenStrategy = require('passport-google-token').Strategy;
const config = require('../../config/config');

module.exports = () => {
  passport.use(new GoogleTokenStrategy({
    clientID: config.googleAuth.clientID,
    clientSecret: config.googleAuth.clientSecret
  }, (accessToken, refreshToken, profile, cb) => {
    cb(null, profile);
  }));
};