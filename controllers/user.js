const { BadRequestError, NotFoundError } = require('../errors');
const UserModel = require('../model/user');
const { StatusCodes } = require('http-status-codes');

const GetUser = async (req, res) => {
  const {
    name,
    gender,
    address,
    department,
    position,
    fromDate,
    toDate,
    membershipType,
    maritalStatus,
    sort,
  } = req.query;

  let queryObject = {};

  if (name) {
    queryObject.firstName = { $regex: name, $options: 'i' };
  }
  if (gender) {
    queryObject.gender = gender;
  }
  if (address) {
    queryObject.address = { $regex: address, $options: 'i' };
  }

  if (membershipType) {
    queryObject.membershipType = membershipType;
  }

  if (maritalStatus) {
    queryObject.maritalStatus = maritalStatus;
  }

  if (position) {
    queryObject.position = position;
  }

  if (fromDate || toDate) {
    queryObject.joinedDate = { $gte: fromDate, $lte: toDate };
  }

  if (department) {
    queryObject.departments = department;
  }
  let users = UserModel.find(queryObject);

  if (sort) {
    users = users.sort([['joinedDate', -1]]);
  } else {
    users = users.sort([['joinedDate', 1]]);
  }

  const result = await users;

  res.status(StatusCodes.OK).json(result);
};

const CreateUser = async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    phone,
    maritalStatus,
    email,
    address,
    departments,
    membershipType,
    position,
    joinedDate,
  } = req.body;

  const data = {
    firstName,
    lastName,
    gender,
    phone,
    maritalStatus,
    email,
    address,
    departments,
    membershipType,
    position,
    joinedDate,
  };
  const user = await UserModel.create({ ...data });

  if (user.membershipType === 'New Member') {
    console.log('follow up department send mail');
  }

  res.status(StatusCodes.CREATED).json({ mesage: `${user.firstName} created` });
};

const UpdateUser = async (req, res) => {
  const { id: _id } = req.params;
  const {
    firstName,
    lastName,
    phone,
    maritalStatus,
    address,
    departments,
    position,
  } = req.body;

  const data = {
    firstName,
    lastName,
    phone,
    maritalStatus,
    address,
    departments,
    position,
  };

  let user = await UserModel.findOne({ _id });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  user = await UserModel.findByIdAndUpdate({ _id }, { ...data }, { new: true });

  res
    .status(StatusCodes.OK)
    .json({ mesage: `${user.firstName} sucessfully updated` });
};
module.exports = {
  CreateUser,
  UpdateUser,
  GetUser,
};
