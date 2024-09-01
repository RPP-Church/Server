const { BadRequestError, NotFoundError } = require('../errors');
const MembersModel = require('../model/members');
const ActivitiesModel = require('../model/activities');
const { StatusCodes } = require('http-status-codes');
const CalculateTotal = require('../middleware/calculateTotal');
const SendEmail = require('../middleware/sendEmail');

const CaptureAttendance = async (req, res) => {
  const { activityId, memberName, memberPhone, memberId } = req.body;

  const type = memberPhone || memberName ? true : false;

  if (!activityId) {
    throw new BadRequestError('missing activityId');
  }

  if (!type) {
    throw new BadRequestError("missing member's info");
  }

  let queryObject = {};

  if (memberName) {
    queryObject.firstName = memberName;
  }

  if (memberPhone) {
    queryObject.phone = memberPhone;
  }

  const findMember = await MembersModel.findOne(queryObject);

  if (findMember === null || (!findMember && !findMember._id)) {
    throw new NotFoundError('Member not yet registered.');
  }

  const activity = await ActivitiesModel.findOne({ _id: activityId });

  if (!activity && !activity._id) {
    throw new NotFoundError(`Activity with ID: ${activityId} not found`);
  }

  const checkAttendance = await findMember?.attendance?.filter(
    (c) => c.serviceId?.toString() === activityId?.toString()
  );

  if (
    checkAttendance?.length > 0 &&
    checkAttendance[0]?.attendance === 'Present'
  ) {
    throw new BadRequestError(
      `${findMember.firstName} already marked present for this activity`
    );
  } else if (checkAttendance?.length <= 0) {
    const attendance = {
      date: activity.date,
      serviceName: activity.serviceName,
      serviceId: activity._id,
      attendance: 'Present',
    };
    await MembersModel.findOneAndUpdate(
      { _id: findMember._id },
      {
        $push: {
          attendance,
        },
      },
      {
        new: true,
      }
    )
      .then((doc) => {
        return res
          .status(StatusCodes.OK)
          .json({ mesage: `${findMember.firstName} attendance captured` });
      })
      .catch((error) => {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ mesage: error.message });
      });
  } else {
    await MembersModel.updateOne(
      { _id: findMember._id, 'attendance.serviceId': activity._id },
      {
        $set: {
          'attendance.$.attendance': 'Present',
          'attendance.$.time': new Date().toLocaleTimeString(),
        },
      }
    )
      .then((doc) => {
        if (doc?.acknowledged) {
          res
            .status(StatusCodes.OK)
            .json({ mesage: `${findMember.firstName} attendance captured` });
        }
      })
      .catch((error) => {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ mesage: error.message });
      });
  }
};

const GenerateTotalAttendance = async (req, res) => {
  const { activityId, type } = req.body;

  if (!activityId) {
    throw new BadRequestError('No activity Id found');
  }

  const activity = await ActivitiesModel.findOne({ _id: activityId });

  if (!activity && !activity._id) {
    throw new NotFoundError(`No activity with ID: ${activityId} found`);
  }

  //! check current time to make sure service has ended
  //! this should be a cron job later

  let queryObject = { serviceId: activity._id };
  if (type) {
    queryObject.attendance = type;
  }

  await MembersModel.find({
    attendance: {
      $elemMatch: queryObject,
    },
  })
    .then(async (doc) => {
      
      const { exc } = await CalculateTotal({
        data: doc,
        type,
        activityId,
        activityName: activity.name,
      });

      const msg = {
        from: 'okoromivic@gmail.com',
        to: 'okoromivic@gmail.com',
        subject: 'Activity download initiated',
        html: `<p>${req.user.name} just initiated a downdload for ${activity.name}-${activity.date}`
      };

      SendEmail({ msg });

      res.send(exc);
    })
    .catch((error) => {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ mesage: error.message });
    });
};

const CaptureAutoAttendance = async (req, res) => {
  const { activityId, memberId } = req.body;

  var todaysDate = new Date().getHours();

  //! check if church has ended
  if (todaysDate > 13) {
    throw new BadRequestError('Date is in the past or future date');
  }

  if (!memberId) {
    throw new NotFoundError('Missing memberId or activityId.');
  }

  let queryObject = {};

  if (memberId) {
    queryObject._id = memberId;
  }
  const findMember = await MembersModel.findOne(queryObject);

  if (findMember === null || (!findMember && !findMember._id)) {
    throw new NotFoundError('Member not yet registered.');
  }

  const activity = await ActivitiesModel.findOne({ _id: activityId });

  if (!activity && !activity?._id) {
    throw new NotFoundError(`Activity with ID: ${activityId} not found`);
  }

  const checkAttendance = await findMember?.attendance?.filter(
    (c) => c.serviceId?.toString() === activityId?.toString()
  );

  if (
    checkAttendance?.length > 0 &&
    checkAttendance[0]?.attendance === 'Present'
  ) {
    throw new BadRequestError(
      `${findMember.firstName} already marked present for this activity`
    );
  } else if (checkAttendance?.length <= 0) {
    const attendance = {
      date: activity.date,
      serviceName: activity.serviceName,
      serviceId: activity._id,
      attendance: 'Present',
    };
    await MembersModel.findOneAndUpdate(
      { _id: findMember._id },
      {
        $push: {
          attendance,
        },
      },
      {
        new: true,
      }
    )
      .then((doc) => {
        return res
          .status(StatusCodes.OK)
          .json({ mesage: `${findMember.firstName} attendance captured` });
      })
      .catch((error) => {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ mesage: error.message });
      });
  } else {
    await MembersModel.updateOne(
      { _id: findMember._id, 'attendance.serviceId': activity._id },
      {
        $set: {
          'attendance.$.attendance': 'Present',
          'attendance.$.time': new Date().toLocaleTimeString(),
        },
      }
    )
      .then((doc) => {
        if (doc?.acknowledged) {
          res
            .status(StatusCodes.OK)
            .json({ mesage: `${findMember.firstName} attendance captured` });
        }
      })
      .catch((error) => {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ mesage: error.message });
      });
  }
};

module.exports = {
  CaptureAttendance,
  GenerateTotalAttendance,
  CaptureAutoAttendance,
};
