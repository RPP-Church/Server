const { BadRequestError, UnauthenticatedError } = require('../errors');
const AdminModel = require('../model/admin.js');
const { StatusCodes } = require('http-status-codes');

const CreateAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const data = {
    name,
    email,
    password,
  };

  const admin = await AdminModel.create({ ...data });

  const token = admin.CreateJWT();
  const refreshToken = admin.RefreshJWT();

  await AdminModel.findOneAndUpdate(
    { _id: admin._id },
    { refreshToken },
    { new: true }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(StatusCodes.CREATED).json({ name: admin.name, token });
};

const LoginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await AdminModel.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  const matchedpassword = await user.comparePassword(password);

  if (!matchedpassword) {
    throw new UnauthenticatedError('Invalid email or password');
  }

  const token = user.CreateJWT();
  const refreshToken = user.RefreshJWT();

  AdminModel.findOneAndUpdate(
    { _id: user._id },
    { refreshToken },
    { new: true }
  );

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(StatusCodes.OK).json({ name: user.name, token });
};


module.exports = {
  CreateAdmin,
  LoginAdmin,
};
