const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../errors');
const AdminModel = require('../model/admin.js');
const { StatusCodes } = require('http-status-codes');
const cookie = require('cookie');

const CreateAdmin = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const data = {
    name,
    email,
    password,
    phone
  };

  const admin = await AdminModel.create({ ...data });

  const token = admin.CreateJWT();
  const refreshToken = admin.RefreshJWT();

  await AdminModel.findOneAndUpdate(
    { _id: admin._id },
    { refreshToken },
    { new: true }
  );

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('foo', 'bar', { httpOnly: true })
  );
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    // secure: true,
    // signed: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res
    .status(StatusCodes.OK)
    .json({ name: admin.name, token, userId: admin._id });
};

const LoginAdmin = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new BadRequestError('Please provide phone and password');
  }

  const user = await AdminModel.findOne({ phone });

  if (!user) {
    throw new NotFoundError('Invalid phone or password');
  }

  const matchedpassword = await user.comparePassword(password);

  if (!matchedpassword) {
    throw new BadRequestError('Invalid phone or password');
  }

  const token = user.CreateJWT();
  const refreshToken = user.RefreshJWT();

  await AdminModel.findOneAndUpdate(
    { _id: user._id },
    { refreshToken },
    { new: true }
  );

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('foo', 'bar', { httpOnly: true })
  );
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    // secure: true,
    // signed: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({ name: user.name, token, userId: user._id });
};

module.exports = {
  CreateAdmin,
  LoginAdmin,
};
