const {
  CreateUser,
  UpdateUser,
  GetUser,
  DeleteUser,
} = require('../controllers/user');
const express = require('express');

const router = express.Router();

router.route('/').post(CreateUser).get(GetUser);

router.route('/:id').patch(UpdateUser).delete(DeleteUser);

module.exports = router;
