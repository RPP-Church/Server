const {
  CreateActivities,
  GetActivities,
  CaptureActivityforMember,
} = require('../controllers/activities');
const express = require('express');

const router = express.Router();

router.route('/').post(CreateActivities).get(GetActivities);
router.route('/member').post(CaptureActivityforMember);

module.exports = router;
