const { CreateUser, UpdateUser, GetUser } = require('../controllers/user');
const express = require('express');

const router = express.Router();

router.route('/').post(CreateUser).get(GetUser);

router.route('/:id').patch(UpdateUser);

module.exports = router;
