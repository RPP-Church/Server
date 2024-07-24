const { BadRequestError } = require('../errors');
const ActivitiesModel = require('../model/activities');
const { StatusCodes } = require('http-status-codes');
const MembersModel = require('../model/members');

const CreateActivities = async (req, res) => {
  const { date, serviceName } = req.body;

  if (!date || !serviceName) {
    throw new BadRequestError('Missing date or service name');
  }

  const getDay = new Date(date).getDay();

  if (getDay > 0) {
    throw new BadRequestError(
      'Activity can only be created for sunday service for now.'
    );
  }

  await ActivitiesModel.create({
    date,
    serviceName,
    createdBy: req.user.name,
  })
    .then(async (doc) => {
      const attendance = {
        date,
        serviceName: doc.serviceName,
        serviceId: doc._id,
        attendance: 'Absent',
      };

      await MembersModel.updateMany(
        {},
        {
          $push: {
            attendance,
          },
        },
        {
          new: true,
        }
      );
      res
        .status(StatusCodes.CREATED)
        .json({ mesage: `${doc.serviceName} created` });
    })
    .catch((error) => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ mesage: error.message });
    });
};

const GetActivities = async (req, res) => {
  const { date, serviceName } = req.params;
  let queryObject = {};

  if (date) {
    queryObject.date = date;
  }
  if (serviceName) {
    queryObject.serviceName = serviceName;
  }

  let data = ActivitiesModel.find(queryObject);

  const result = await data;

  res.status(StatusCodes.OK).json(result);
};

const CaptureActivityforMember = async (req, res) => {
  const { activityId, memberName, memberPhone, memberId } = req.body;

  const findMember = await MembersModel.findOne({ phone: memberPhone });

  if (!findMember && !findMember._id) {
    throw new NotFoundError('Member not yet registered.');
  }

  const activity = await ActivitiesModel.findOne({ _id: activityId });

  if (!activity && !activity._id) {
    throw new NotFoundError(`Activity with ID: ${activityId} not found`);
  }

  const attendance = {
    date: activity.data,
    serviceName: activity.serviceName,
    serviceId: activity._id,
    attendance: 'Present',
  };
  await MembersModel.updateOne(
    { _id: findMember._id },
    {
      $push: {
        attendance,
      },
    },
    {
      new: true,
    }
  );
};
module.exports = {
  CreateActivities,
  GetActivities,
  CaptureActivityforMember,
};
