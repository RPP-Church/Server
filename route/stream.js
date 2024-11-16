const express = require('express');
const { GetStreamUrl } = require('../controllers/stream');
const router = express.Router();




router.route('/').get(GetStreamUrl);

module.exports = router;
