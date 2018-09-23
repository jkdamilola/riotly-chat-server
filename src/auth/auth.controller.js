const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const User = require('../user/user.model');
const userCtrl = require('../user/user.controller');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');

/**
 * Returns jwt token and user object
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  if (req.user) {
    const profile = req.user;
    const email = profile.emails[0].value;

    return User.findOne({ email })
    .exec()
    .then((user) => {
      if (user) {
        return Promise.resolve(user);
      }

      const newUser = new User({
        name: profile.displayName,
        email,
        picture: profile._json.picture
      });

      return newUser.save();
    })
    .then(user => userCtrl.getUserById(user._id))
    .then((user) => {
      const token = jwt.sign(
        { userId: user._id },
        config.jwtSecret,
        { expiresIn: 60 * 60 * 24 * 10 },
      );

      return res.json({
        success: true,
        token,
        user
      });
    });
  }

  const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
  return next(err);
}

module.exports = { login };
