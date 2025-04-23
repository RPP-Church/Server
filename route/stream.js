const express = require('express');
const {
  GetStreamUrl,
  GetAuth,
  CreateStream,
} = require('../controllers/stream');
const upload = require('../middleware/multer');
const router = express.Router();

router
  .route('/')
  .get(GetStreamUrl)
  .post(upload.single('thumbnail'), CreateStream);
router.route('/auth').get(GetAuth);

module.exports = router;
