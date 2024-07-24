const { BadRequestError, NotFoundError } = require('../errors');
const MembersModel = require('../model/members');
const ActivitiesModel = require('../model/activities');
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
    dob,
    userId,
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

  if (dob) {
    queryObject.dob = dob;
  }

  if (department) {
    queryObject.departments = department;
  }

  if (userId) {
    queryObject._id = userId;
  }
  let users = MembersModel.find(queryObject);

  if (sort === 'true') {
    users = users.sort([['firstName', -1]]);
  } else {
    users = users.sort([['firstName', 1]]);
  }

  const result = await users;

  res.status(StatusCodes.OK).json(result);
};

const CreateUser = async (req, res) => {
  const {
    title,
    profilePicture,
    firstName,
    lastName,
    gender,
    phone,
    category,
    maritalStatus,
    spouseName,
    email,
    address,
    departments,
    membershipType,
    joinedDate,
    dateOfBirth,
  } = req.body;

  const month = dateOfBirth ? new Date(dateOfBirth).getMonth() + 1 : '';
  const day = dateOfBirth ? new Date(dateOfBirth).getDay() + 1 : '';

  const data = {
    title,
    profilePicture,
    firstName,
    lastName,
    gender,
    phone,
    category,
    maritalStatus,
    spouseName,
    email,
    address,
    departments,
    membershipType,
    joinedDate,
    dateOfBirth: dateOfBirth
      ? `${day.toString()?.padStart(2, '0')}-${month
          .toString()
          ?.padStart(2, '0')}`
      : '',
  };

  for (const keys in Object.assign(data)) {
    if (data[keys] === '') {
      delete data[keys];
    }
  }
  const activities = await ActivitiesModel.find({});

  const user = await MembersModel.create({ ...data })
    .then((doc) => {
      const allActivities = activities.map((item) => ({
        date: item.date,
        serviceName: item.serviceName,
        serviceId: item._id,
        time: item.time || '',
        attendance: 'Absent',
      }));
      doc.attendance = allActivities;
      doc.save();
      res
        .status(StatusCodes.CREATED)
        .json({ mesage: `${doc.firstName} created` });
    })
    .catch((error) => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ mesage: error.message });
    });

  // if (user.membershipType === 'New Member') {
  //   console.log('follow up department send mail');
  // }

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
    membershipType,
    interest,
  } = req.body;

  const data = {
    firstName,
    lastName,
    phone,
    maritalStatus,
    address,
    departments,
    position,
    membershipType,
    interest,
  };

  let user = await MembersModel.findOne({ _id });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  user = await MembersModel.findByIdAndUpdate(
    { _id },
    { ...data },
    { new: true }
  );

  res
    .status(StatusCodes.OK)
    .json({ mesage: `${user.firstName} sucessfully updated` });
};

const DeleteUser = async (req, res) => {
  const { id: _id } = req.params;

  let user = await MembersModel.findOne({ _id });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  user = await MembersModel.findByIdAndDelete({ _id });

  res
    .status(StatusCodes.OK)
    .json({ mesage: `${user.firstName} sucessfully deleted` });
};

module.exports = {
  CreateUser,
  UpdateUser,
  GetUser,
  DeleteUser,
};
