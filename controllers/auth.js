const { BadRequestError, NotFoundError } = require('../errors');
const AdminModel = require('../model/admin.js');
const { StatusCodes } = require('http-status-codes');
const cookie = require('cookie');
const SendEmail = require('../middleware/sendEmail.js');
const MemberModel = require('../model/members.js');

const CreateAdmin = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone) {
    throw new BadRequestError('Phone number missing');
  }

  if (!password) {
    throw new BadRequestError('Temporary password is missing');
  }

  const findMember = await MemberModel.findOne({ phone });

  if (!findMember?._id) {
    throw new NotFoundError('No user exist');
  }

  const findPermissions = findMember?.permission
    ?.find((c) => c.name === 'AUTH')
    ?.permissions?.find((c) => c.name === 'login');

  if (!findPermissions?.name) {
    throw new BadRequestError('User has no AUTH permission to login');
  }

  if (findMember?.password) {
    throw new BadRequestError('User already has login permission and details');
  }

  const newPassword = await findMember.saltPassword(password);

  await MemberModel.findOneAndUpdate(
    { _id: findMember._id },
    { password: newPassword },
    { new: true }
  );
  // if (findMember?.email) {
  //   const msg = {
  // from: {
  //   email: 'okoromivic@gmail.com',
  // },
  // personalizations: [
  //   {
  //     to: [
  //       {
  //         email: findMember?.email,
  //       },
  //     ],
  //     dynamic_template_data: {
  //       first_name: findMember?.firstName,
  //       password: password,
  //       phone: findMember?.phone,
  //     },
  //   },
  // ],
  // templateId: 'd-194c8826c94149f9bde3b8ba9cf409bd',
  //};
  //SendEmail({ msg });
  //}

  res.status(StatusCodes.OK).json({ message: 'Login details created' });
};
const LoginAdmin = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new BadRequestError('Please provide phone and password');
  }

  const user = await MemberModel.findOne({ phone });

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
  res.status(StatusCodes.OK).json({
    name: user.firstName,
    token,
    userId: user._id,
    role: user?.permission,
  });
};

const GetSingleAdmin = async (req, res) => {
  const { id } = req.params;

  const findAmdin = AdminModel.findOne({ _id: id }).select({
    password: 0,
    refreshToken: 0,
  });

  const data = await findAmdin;

  res.status(StatusCodes.OK).json({ data });
};

const UpdateSingleAdmin = async (req, res) => {
  const { id } = req.params;

  const { phone, email } = req.body;

  let updateObject = {};

  if (phone) {
    updateObject.phone = phone;
  }

  if (email) {
    updateObject.email = email;
  }

  await AdminModel.findOneAndUpdate({ _id: id }, updateObject, {
    new: true,
  });

  res.status(StatusCodes.OK).json({ message: 'Record updated' });
};

const UpdatePassword = async (req, res) => {
  const { id } = req.params;

  const { password, oldPassword } = req.body;

  if (!oldPassword) {
    throw new BadRequestError('Provide Old Password');
  }

  if (!password) {
    throw new BadRequestError('Password is missing');
  }

  const user = await AdminModel.findOne({ _id: id });

  const matchedpassword = await user.comparePassword(oldPassword);

  if (matchedpassword) {
    const newPassword = await user.saltPassword(password);
    await AdminModel.findOneAndUpdate(
      { _id: id },
      { password: newPassword },
      {
        new: true,
      }
    );

    res.status(StatusCodes.OK).json({ message: 'Record updated' });
  } else {
    throw new BadRequestError('Old Password does not match');
  }
};
module.exports = {
  CreateAdmin,
  LoginAdmin,
  GetSingleAdmin,
  UpdateSingleAdmin,
  UpdatePassword,
};
