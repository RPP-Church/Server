const {
  CreateUser,
  UpdateUser,
  GetUser,
  DeleteUser,
  GetASingleMember
} = require('../controllers/members');
const express = require('express');

const router = express.Router();

router.route('/').post(CreateUser).get(GetUser);

router.route('/:id').patch(UpdateUser).delete(DeleteUser).get(GetASingleMember)

module.exports = router;
