const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/config');

// Checking token middleware
function authenticate(req, res, next) {
  if (req.headers.authorization) {
    const [prefix, token] = req.headers.authorization.split(' ');

    if (prefix === 'Bearer') {
      return jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
          return res.status(403).send({
            success: false,
            message: 'Failed to authenticate token.',
          });
        }

        req.decoded = decoded;
        return next();
      });
    }
  }

  return res.status(403).send({
    success: false,
    message: 'No token provided',
  });
}

module.exports = authenticate;