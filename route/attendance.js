const { CaptureAttendance } = require('../controllers/attendance');
const express = require('express');

const router = express.Router();

router.route('/').post(CaptureAttendance)

module.exports = router;
