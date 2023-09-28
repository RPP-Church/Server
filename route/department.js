const {
  CreateDepartment,
  UpdateDepartment,
  GetDepartments,
} = require('../controllers/department');
const express = require('express');

const router = express.Router();

router.route('/').post(CreateDepartment).get(GetDepartments);

router.route('/:id').patch(UpdateDepartment);

module.exports = router;
