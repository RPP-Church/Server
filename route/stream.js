const express = require('express');
const {
  GetStreamUrl,
  GetAuth,
  CreateStream,
  
} = require('../controllers/stream');
const router = express.Router();

router.route('/').get(GetStreamUrl).post(CreateStream);
router.route('/auth').get(GetAuth);

module.exports = router;
