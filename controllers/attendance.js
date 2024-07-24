const { BadRequestError, NotFoundError } = require('../errors');
const MembersModel = require('../model/members');
const ActivitiesModel = require('../model/activities');
const { StatusCodes } = require('http-status-codes');

const CaptureAttendance = async (req, res) => {
  const { activityId, memberName, memberPhone, memberId } = req.body;

  if (!activityId && !memberPhone) {
    throw new BadRequestError("missing activityId and member's info");
  }

  const findMember = await MembersModel.findOne({ phone: memberPhone });

  if (!findMember && !findMember._id) {
    throw new NotFoundError('Member not yet registered.');
  }

  const activity = await ActivitiesModel.findOne({ _id: activityId });

  if (!activity && !activity._id) {
    throw new NotFoundError(`Activity with ID: ${activityId} not found`);
  }

  const checkAttendance = await findMember?.attendance?.find(
    (c) => c.serviceId?.toString() === activityId?.toString()
  );

  if (checkAttendance?.attendance === 'Present') {
    throw new BadRequestError(
      `${findMember.firstName} already marked present for this activity`
    );
  }

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
};


module.exports = {
  CaptureAttendance,
};
