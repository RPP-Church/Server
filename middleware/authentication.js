const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   throw new UnauthenticatedError('Unauthorized access');
  // }

  const bearer = authHeader.split(' ')[1];
  try {
    const token = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmEwZDk2NGQzN2YwNTgwOWNmMDFiMDIiLCJuYW1lIjoiVmljdG9yIE9rb3JvbWkiLCJpYXQiOjE3MjE4MjMzNDcsImV4cCI6MTcyMTkwOTc0N30.DeWD-9OYcrr9e0KoOv_qnKD2oi48-mmnmobuTHg_UkU", process.env.JWT_SECRET);
    
    req.user = { userId: token.userId, name: token.name };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Unauthorized access');
  }
};

module.exports = auth;
