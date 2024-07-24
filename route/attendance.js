const {
  CaptureAttendance,
  GenerateTotalAttendance,
} = require('../controllers/attendance');
const express = require('express');

const router = express.Router();

router.route('/').post(CaptureAttendance);
router.route('/total').post(GenerateTotalAttendance);

module.exports = router;
