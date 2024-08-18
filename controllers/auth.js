const { BadRequestError, NotFoundError } = require('../errors');
const AdminModel = require('../model/admin.js');
const { StatusCodes } = require('http-status-codes');
const cookie = require('cookie');
const SendEmail = require('../middleware/sendEmail.js');

const CreateAdmin = async (req, res) => {
  const { firstName, lastName, email, password, phone, gender } = req.body;

  const data = {
    firstName,
    email,
    password,
    phone,
    lastName,
    gender,
  };

  if (email) {
    const findEmail = await AdminModel.findOne({ email });

    if (findEmail && findEmail?._id) {
      throw new BadRequestError('Admin with email found');
    }
  }

  await AdminModel.create({ ...data })
    .then((doc) => {
      if (doc?.email) {
        const message = `
              <div>
                  <h4>Hello! ${doc.firstName}</h4>
                  <div>
                      <p>Welcome to Resurrection Power Parish Member Managment and Record Team.</p>
                      <p>A user details has been recreated for you, please see below the login details:</p>
                      <h4 style="margin: 0;">Phone: ${doc.phone}</h4>
                      <h4 style="margin: 0;">Password: 123456</h4>
                      <p style="margin-top: 20px; font-style: italic; font-size: 14px;">Kindly use the link <a href='https://rppchurch.netlify.app/login' style="color: blue; font-style: italic; font-size: 14px;">Login</a> to access the dashboard. It's recommended to change your password after login.</p>

                      <h3 style="color: red; font-style: italic;">Important Notice</h3>
                      <ul>
                        <li>Member's information are to be treated with utmost confidentiality.</li>
                        <li>Any Admin found exploring any member information will be reported to
                        the pastorate and remove from using the system</li>
                        <li>Pay utmost respect to member's information</li>
                      </ul>

                      <div style="magin-top: 30px;">
                        <p style="margin: 0; font-style: italic;">Warm Welcome</p>
                        <p style="margin: 0; font-style: italic;">Okoromi Victor</p>
                      </div>
                  </div>

              </div>
        
        `;

        const msg = {
          from: {
            email: 'okoromivic@gmail.com',
          },
          personalizations: [
            {
              to: [
                {
                  email: email,
                },
              ],
              dynamic_template_data: {
                first_name: doc.firstName,
                password: password,
                phone: doc.phone,
              },
            },
          ],
          templateId: 'd-194c8826c94149f9bde3b8ba9cf409bd',
        };
        SendEmail({ msg });
      }

      res.status(StatusCodes.OK).json({ name: doc.firstName });
    })
    .catch((error) => {
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    });

  // const token = admin.CreateJWT();
  // const refreshToken = admin.RefreshJWT();

  // await AdminModel.findOneAndUpdate(
  //   { _id: admin._id },
  //   { refreshToken },
  //   { new: true }
  // );

  // res.setHeader(
  //   'Set-Cookie',
  //   cookie.serialize('foo', 'bar', { httpOnly: true })
  // );
  // res.cookie('jwt', refreshToken, {
  //   httpOnly: true,
  //   // secure: true,
  //   // signed: true,
  //   maxAge: 24 * 60 * 60 * 1000,
  // });
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

  res
    .status(StatusCodes.OK)
    .json({ name: user.firstName, token, userId: user._id });
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
