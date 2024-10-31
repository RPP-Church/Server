const { CreateArchive, GetArchive } = require('../controllers/archive');
const rbacMiddleware = require('../middleware/checkPermission');
const express = require('express');

const router = express.Router();

router
  .route('/:userId')
  .post(
    rbacMiddleware.checkPermission('ARCHIVE', 'create_archive'),
    CreateArchive
  );

router
  .route('/')
  .get(rbacMiddleware.checkPermission('ARCHIVE', 'read_archive'), GetArchive);

module.exports = router;
