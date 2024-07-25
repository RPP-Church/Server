const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //   throw new UnauthenticatedError('Unauthorized access');
  // }

  const bearer = authHeader.split(' ')[1];
  try {
    const token = jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmEwZDk2NGQzN2YwNTgwOWNmMDFiMDIiLCJuYW1lIjoiVmljdG9yIE9rb3JvbWkiLCJpYXQiOjE3MjE5MDk5MTEsImV4cCI6MTcyMTk5NjMxMX0.mpxy9ui8mpcZWcl-dUICGtq-qgPrB_l7JXdxW7SQJO8", process.env.JWT_SECRET);
    
    req.user = { userId: token.userId, name: token.name };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Unauthorized access');
  }
};

module.exports = auth;
