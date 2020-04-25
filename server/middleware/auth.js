const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');
  //Check if token is present
  if (!token) {
    res.status(400).json({ msg: 'No token, authorization is denied' });
  }

  //Verify the token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(400).json({ msg: 'Token is unauthorized' });
  }
};
