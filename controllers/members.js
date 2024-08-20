const { BadRequestError, NotFoundError } = require('../errors');
const MembersModel = require('../model/members');
const ActivitiesModel = require('../model/activities');
const { StatusCodes } = require('http-status-codes');
const SendEmail = require('../middleware/sendEmail');
const generateUniqueRef = require('../middleware/generateId');
const CalculateTotal = require('../middleware/calculateTotal');
const fs = require('fs');
var path = require('path');

const GetASingleMember = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('No Id found');
  }

  await MembersModel.findOne({ _id: id })
    .then((doc) => {
      res.status(StatusCodes.OK).json({ data: doc });
    })
    .catch((error) => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    });
};

const GetUser = async (req, res) => {
  const {
    firstName,
    gender,
    address,
    department,
    fromDate,
    toDate,
    membershipType,
    maritalStatus,
    sort,
    dob,
    phone,
    category,
    lastName,
  } = req.query;

  const pageOptions = {
    page: parseInt(req.query.page - 1, 10) || 0,
    limit: parseInt(req.query.limit, 10) || 10,
  };

  let queryObject = {};

  if (firstName) {
    queryObject.firstName = { $regex: firstName, $options: 'i' };
  }

  if (lastName) {
    queryObject.lastName = { $regex: lastName, $options: 'i' };
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

  if (fromDate || toDate) {
    queryObject.joinedDate = { $gte: fromDate, $lte: toDate };
  }

  if (dob) {
    queryObject.dateOfBirth = dob;
  }

  if (department) {
    queryObject.departments = {
      $elemMatch: { name: department },
    };
  }

  if (phone) {
    queryObject.phone = phone;
  }

  if (category) {
    queryObject.category = category;
  }

  let users = MembersModel.find(queryObject)
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort([['createdAt', -1]]);

  const Count = await MembersModel.countDocuments(queryObject);

  if (sort === 'true') {
    users = users.sort([['firstName', -1]]);
  } else {
    users = users.sort([['firstName', 1]]);
  }

  const result = await users;
  const totalPage = Math.round(Count / pageOptions.limit);

  const pagination =
    Math.round(Count % pageOptions.limit) === 0 ? totalPage : totalPage + 1;
  res.status(StatusCodes.OK).json({
    data: result,
    length: result.length,
    totalElement: Count,
    totalPage: pagination,
    numberofElement: result?.length,
    current: pageOptions?.page,
  });
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

  if (email || phone) {
    let query = {};
    if (email) {
      query.email = email;
    }
    if (phone) {
      query.phone = phone;
    }
    const findMember = await MembersModel.findOne(query);

    if (findMember && findMember?._id) {
      throw new BadRequestError('Member phone or email already exist');
    }
  }

  // const month = dateOfBirth ? new Date(dateOfBirth).getMonth() + 1 : '';
  // const day = dateOfBirth ? new Date(dateOfBirth).getDay() + 1 : '';

  const Id = await generateUniqueRef();
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
    dateOfBirth: dateOfBirth,
    memberId: Id,
    // ? `${day.toString()?.padStart(2, '0')}-${month
    //     .toString()
    //     ?.padStart(2, '0')}`
    // : '',
  };

  for (const keys in Object.assign(data)) {
    if (data[keys] === '') {
      delete data[keys];
    }
  }

  const user = await MembersModel.create({ ...data })
    .then(async (doc) => {
      if (me !== 'Visitor') {
        const activities = await ActivitiesModel.find({});
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
      } else {
        res
          .status(StatusCodes.CREATED)
          .json({ mesage: `${doc.firstName} created for visitor` });
      }
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
    membershipType,
    email,
  } = req.body;

  let user = await MembersModel.findOne({ _id });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  let data = {
    updatedBy: req.user.name,
  };

  if (firstName) {
    data.firstName = firstName;
  }

  if (lastName) {
    data.lastName = lastName;
  }

  if (phone) {
    data.phone = phone;
  }

  if (maritalStatus) {
    data.maritalStatus = maritalStatus;
  }

  if (address) {
    data.address = address;
  }

  if (departments) {
    data.departments = departments;
  }

  if (address) {
    data.address = address;
  }

  if (membershipType) {
    data.membershipType = membershipType;
  }

  if (email) {
    data.email = email;
  }

  user = await MembersModel.findByIdAndUpdate({ _id }, data, { new: true });

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

const AutoUpdateMember = async ({ todayDay, activityDate }) => {
  const activity = await ActivitiesModel.findOne({ date: activityDate });

  //! if no activity found, stop the job? return or send a mail
  if (activity?._id) {
    let queryObject = { serviceId: activity._id };

    await MembersModel.find({
      attendance: {
        $elemMatch: queryObject,
      },
    })
      .then(async (doc) => {
        const fileName = `${'report'}-${activityDate}`;
        const firstTimer = doc.filter((c) => c.membershipType === 'New Member');
        const male = firstTimer.map((c) => c.firstTimer === 'Male');
        const female = firstTimer.map((c) => c.firstTimer === 'Female');

        const { exc } = await CalculateTotal({
          data: doc,
          activityId: activity._id,
          activityName: activity.serviceName,
          sendReport: true,
          fileName,
        });

        const pathToAttachment = path.join(
          __dirname,
          '..',
          'report',
          `${fileName}.xlsx`
        );
        attachment = fs.readFileSync(pathToAttachment).toString('base64');
        var dir = './report';

        const msg = {
          from: {
            email: 'okoromivic@gmail.com',
          },
          personalizations: [
            {
              to: [
                {
                  email: 'okoromivic@gmail.com',
                },
              ],
              dynamic_template_data: {
                date: activityDate,
                service_name: activity.serviceName,
                male: male.length || 0,
                female: female.length || 0,
                total: firstTimer.length || 0,
              },
            },
          ],
          templateId: 'd-cfd316f4138a47e9b7d7bc4f6448d355',
          attachments: [
            {
              content: attachment,
              filename: `${fileName}.xlsx`,
              type: 'application/xlsx',
              disposition: 'attachment',
            },
          ],
        };

        const message = await SendEmail({ msg }).then((res) => {
          if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`${dir} File successfully.`);
          }
        });
      })
      .catch((error) => {
        console.log('error in sending repoer', error.message);
      });
  }
};

module.exports = {
  CreateUser,
  UpdateUser,
  GetUser,
  DeleteUser,
  GetASingleMember,
  AutoUpdateMember,
};
