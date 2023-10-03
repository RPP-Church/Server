const {
  CreateDepartment,
  UpdateDepartment,
  GetDepartments,
  DeleteDepartment
} = require('../controllers/department');
const express = require('express');

const router = express.Router();

router.route('/').post(CreateDepartment).get(GetDepartments);

router.route('/:id').patch(UpdateDepartment).delete(DeleteDepartment)

module.exports = router;
