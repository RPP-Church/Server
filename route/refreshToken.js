const express = require('express');
const refreshToken = require('../controllers/refreshtoken');

const router = express.Router();

router.post('/', refreshToken);

module.exports = router;