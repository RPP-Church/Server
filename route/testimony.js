const express = require('express');
const { CreateTestimony, GetTestimony } = require('../controllers/testimony');
const router = express.Router();

router.route('/').get(GetTestimony).post(CreateTestimony);

module.exports = router;
