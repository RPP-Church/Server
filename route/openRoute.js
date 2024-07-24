const { CreateUser } = require('../controllers/members');
const { GetDepartments } = require('../controllers/department');
const express = require('express');

const router = express.Router();

router.route('/createuser').post(CreateUser);
router.route('/department').get(GetDepartments);

module.exports = router;
