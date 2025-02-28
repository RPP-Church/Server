const { NotFoundError, UnauthenticatedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const User = require('../model/members');
const jwt = require('jsonwebtoken');

const RefreshToken = async (req, res) => {
  const { jwt: refreshToken } = req?.cookies || {}; // Extract token from cookies
  const { userId } = req.query;

  if (!refreshToken || !userId) {
    throw new UnauthenticatedError('Unauthorized access');
  }

  const user = await User.findOne({ _id: userId });

  if (!user || !user.refreshToken) {
    throw new UnauthenticatedError('Invalid or expired refresh token');
  }

  jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
    if (err || !decoded?.userId || decoded.userId !== user.id) {
      throw new NotFoundError('Refresh token is invalid or expired');
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, name: user.name, role: user.permission },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(StatusCodes.OK).json({
      name: user.name,
      token: newAccessToken,
      userId: user.id,
      role: user.permission,
    });
  });
};

module.exports = RefreshToken;
