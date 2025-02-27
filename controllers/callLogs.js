const CallLog = require('../models/CallLog');
const MembersModel = require('../model/members');
const ActivitiesModel = require('../model/activities');
const Permission = require('../model/config');
const { default: mongoose } = require('mongoose');
const CallLogsModel = require('../model/callLogs');
const nodemailer = require('nodemailer');
const moment = require('moment');

// // Schedule report to run every Sunday at midnight
// const schedule = require('node-schedule');
// schedule.scheduleJob('0 0 * * 0', generateWeeklyCallReport); // Runs every Sunday

const GetCallLog = async (req, res) => {
  try {
    const userId = req.user.userId;

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Get last Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Get Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    let queryObject = {
      adminId: userId,
      assignedDate: { $gte: startOfWeek, $lte: endOfWeek },
    };

    const weeklyCalls = await CallLog.find(queryObject);
    res.status(200).json({ data: weeklyCalls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const UpdateCallStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['Completed', 'Failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const callLog = await CallLog.findById(id);
    if (!callLog) {
      return res.status(404).json({ message: 'Call log not found' });
    }

    callLog.status = status;
    callLog.callTimestamp = new Date();
    if (notes) callLog.notes = notes;

    await callLog.save();

    res.status(200).json({ message: 'Call log updated successfully', callLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  GetCallLog,
  UpdateCallStatus,
};
