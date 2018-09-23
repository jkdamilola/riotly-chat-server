const User = require('./user.model');


function getUserById(id) {
  return User.get(id).then(user => {
    if (!user) {
      return Promise.reject('There is no users with this ID');
    }

    return Promise.resolve(user);
  });
}

/**
 * Load user and append to req.
 */
function load(req, res, next) {
  return getUserById(req.decoded.userId).then(user => {
    return res.json({
      success: true,
      message: 'User information has been retrieved',
      user,
    });
  }).catch(err => {
    return res.json({
      success: false,
      message: 'There is no users with this ID',
    });
    next(err)
  });
}

module.exports = { getUserById, load };
