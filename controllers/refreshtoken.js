const { NotFoundError, UnauthenticatedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const User = require('../model/members');
const jwt = require('jsonwebtoken');

const RefreshToken = async (req, res) => {
  const cookie = req?.cookies?.jwt;
  const { userId } = req.query;

  // if (!cookie) {
  //   throw new UnauthenticatedError('Unauthorized access');
  // }
  if (!userId) {
    throw new UnauthenticatedError('Unauthorized access');
  }

  // const refreshToken = token;

  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
    if (err || user.name !== decoded.name)
      throw new NotFoundError('Refresh token not found');

    const token = jwt.sign(
      { userId: decoded.userId, name: decoded.name },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      }
    );
    res
      .status(StatusCodes.CREATED)
      .json({ name: user.name, token, userId: user._id });
  });
};

module.exports = RefreshToken;
