const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'qasyounsecret123', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;