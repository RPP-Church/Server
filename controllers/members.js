const { BadRequestError, NotFoundError } = require('../errors');
const MembersModel = require('../model/members');
const ActivitiesModel = require('../model/activities');
const { StatusCodes } = require('http-status-codes');
const SendEmail = require('../middleware/sendEmail');
const generateUniqueRef = require('../middleware/generateId');
const CalculateTotal = require('../middleware/calculateTotal');
const Roles = require('../model/config');
const fs = require('fs');
var path = require('path');
const toTitleCase = require('../middleware/toLower');
const { AwsS3 } = require('../middleware/awsUpload');

const GetASingleMember = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new BadRequestError('No Id found');
  }

  await MembersModel.findOne({ _id: id })
    .select({ password: 0 })
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
    name,
  } = req.query;

  const pageOptions = {
    page: parseInt(req.query.page - 1, 10) || 0,
    limit: parseInt(req.query.limit, 10) || 10,
  };

  let queryObject = {};

  if (name) {
    queryObject.$expr = {
      $regexMatch: {
        input: {
          $concat: ['$firstName', ' ', '$lastName'],
        },
        regex: name,
        options: 'i',
      },
    };
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
    .sort([['createdAt', -1]])
    .select({ password: 0 });

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
    firstName: toTitleCase(firstName),
    lastName: toTitleCase(lastName),
    gender,
    phone,
    category,
    maritalStatus,
    spouseName: toTitleCase(spouseName),
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
      if (doc.membershipType !== 'Visitor') {
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
    title,
    dateOfBirth,
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

  if (title) {
    data.title = title;
  }

  if (dateOfBirth) {
    data.dateOfBirth = dateOfBirth;
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
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  const year = new Date().getFullYear();

  const searchDate = `${month.toString()?.padStart(2, '0')}/${day
    .toString()
    ?.padStart(2, '0')}/${year}`;

  const activity = await ActivitiesModel.findOne({ date: searchDate });

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
        const firstTimer = await doc.filter(
          (c) => c.membershipType === 'New Member'
        );
        const male = firstTimer.filter((c) => c.gender === 'Male');
        const female = firstTimer.filter((c) => c.gender === 'Female');
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
            // 'olufemioludotun2020@gmail.com'
            {
              to: ['okoromivic@gmail.com'],
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

const AddPermissionMember = async (req, res) => {
  const { id, permission, memberId } = req.body;

  if (!id) {
    throw new BadRequestError('Id missing');
  }

  if (permission?.length <= 0) {
    throw new BadRequestError('Please select permission to assign');
  }

  const findRole = await Roles.findOne({ _id: id });

  if (!findRole?._id) {
    throw new BadRequestError('Role not found');
  }

  const findPerson = await MembersModel.findOne({ _id: memberId });

  if (findPerson?.permission?.length > 0) {
    let newPermission = findPerson?.permission;
    const findRoleName = newPermission?.find((c) => c.name === findRole.name);
    if (findRoleName?.name) {
      await MembersModel.findOneAndUpdate(
        {
          permission: {
            $elemMatch: {
              name: findRole.name,
            },
          },
        },
        {
          $set: {
            'permission.$.permissions': permission,
          },
        }
      );
      return res
        .status(StatusCodes.OK)
        .json({ message: `permission sucessfully added` });
    } else {
      await MembersModel.findOneAndUpdate(
        { _id: memberId },
        {
          $push: {
            permission: [
              { name: findRole.name, permissions: permission, permId: id },
            ],
          },
        },
        {
          new: true,
        }
      );
      return res
        .status(StatusCodes.OK)
        .json({ message: `permission sucessfully added` });
    }
  } else {
    await MembersModel.findOneAndUpdate(
      { _id: memberId },
      {
        $push: {
          permission: [
            { name: findRole.name, permissions: permission, permId: id },
          ],
        },
      },
      {
        new: true,
      }
    );
    return res
      .status(StatusCodes.OK)
      .json({ message: `permission sucessfully added` });
  }
};

const GetProfileDetails = async (req, res) => {
  const { id } = req.params;

  const userId = req.user.userId;
  if (id !== userId) {
    throw new BadRequestError('Can only get your account details');
  }

  const data = await MembersModel.findOne({ _id: id }).select({
    password: 0,
    permission: 0,
    attendance: 0,
  });
  return res.status(StatusCodes.OK).json({ data });
};

const AddImageMember = async (req, res) => {
  const { memberId, image } = req.body;

  if (!memberId) {
    throw new BadRequestError('No id found for this upload');
  }

  if (!image) {
    throw new BadRequestError('Attach image to upload');
  }

  const finduser =await  MembersModel.findOne({ _id: memberId });

  if (!finduser?._id) {
    throw new NotFoundError('User not found');
  }

  const upload = await AwsS3({ image, folder: '/members' });

  MembersModel.findByIdAndUpdate(
    { _id: memberId },
    { profilePicture: upload?.Location || '' }
  )
    .then(async (doc) => {
      return res.status(StatusCodes.OK).json({ data:doc });
    })
    .catch((error) => {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    });
};
module.exports = {
  CreateUser,
  UpdateUser,
  GetUser,
  DeleteUser,
  GetASingleMember,
  AutoUpdateMember,
  AddPermissionMember,
  GetProfileDetails,
  AddImageMember,
};
