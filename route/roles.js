const { createRole, getRoles } = require('../controllers/role');
const rbacMiddleware = require('../middleware/checkPermission');
const express = require('express');

const router = express.Router();

router
  .route('/')
  .post(rbacMiddleware.checkPermission('SYSTEM', 'create_roles'), createRole)
  .get(rbacMiddleware.checkPermission('SYSTEM', 'read_roles'), getRoles);

module.exports = router;
