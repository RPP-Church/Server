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
  if (getDay === NaN) {
    throw new BadRequestError('Invalid Date');
  }
  if (getDay > 0) {
    throw new BadRequestError(
      'Activity can only be created for sunday service for now.'
    );
  }

  const month = new Date(date).getMonth() + 1;
  const day = new Date(date).getDate();
  const year = new Date(date).getFullYear();

  await ActivitiesModel.create({
    date: `${day.toString()?.padStart(2, '0')}-${month
      .toString()
      ?.padStart(2, '0')}-${year}`,
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
  const { date, serviceName } = req.query;

  const pageOptions = {
    page: parseInt(req.query.page - 1, 10) || 0,
    limit: parseInt(req.query.limit, 10) || 10,
  };

  let queryObject = {};

  if (date) {
    queryObject.date = date;
  }
  if (serviceName) {
    queryObject.serviceName = serviceName;
  }

  console.log(date)

  let data = ActivitiesModel.find(queryObject)
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .sort([['createdAt', -1]]);

  const Count = await ActivitiesModel.countDocuments(queryObject);

  const result = await data;

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

const GetCaptureActivity = async (req, res) => {
  const { date } = req.body;

  if (!date) {
    throw new BadRequestError('Date is missing');
  }

  Date.prototype.isValid = function () {
    return this.getTime() === this.getTime();
  };

  var d = new Date(date);
  if (!d.isValid()) {
    throw new BadRequestError('Date is invalid');
  }

  let queryObject = {};
  if (date) {
    queryObject.date = date;
  }

  const activity = await ActivitiesModel.findOne(queryObject);

  if (activity && activity?._id) {
    res.status(StatusCodes.OK).json({
      data: activity,
    });
  } else {
    const getDay = new Date(date).getDay();
    const getTime = new Date(date).getTime();
 
    if (getDay == NaN) {
      throw new BadRequestError('Invalid Date');
    }

    if (getTime == NaN) {
      throw new BadRequestError('Invalid Date');
    }
    if (getDay > 0) {
      throw new BadRequestError(
        'Activity can only be created for sunday service for now.'
      );
    }

    const month = new Date(date).getMonth() + 1;
    const day = new Date(date).getDate();
    const year = new Date(date).getFullYear();
    console.log(getTime, 'get');
    res.send('hello');
  }
};
module.exports = {
  CreateActivities,
  GetActivities,
  CaptureActivityforMember,
  GetCaptureActivity,
};
