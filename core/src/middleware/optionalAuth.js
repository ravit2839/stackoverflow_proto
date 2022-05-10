const JWT = require('jsonwebtoken');
const config = require('../config');
const { responseHandler } = require('../helpers');

const optionalAuth = (req, res, next) => {
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    next()
    return
  }

  // Verify token
  try {
    JWT.verify(token, config.JWT.SECRET, (error, decoded) => {
      if (error) {
        next()
      }
      req.user = decoded.user;
      next();
    });
  } catch (err) {
    next()
  }
};

module.exports = optionalAuth;
