const { CreateAdmin, LoginAdmin } = require('../controllers/auth.js');
const express = require('express');

const router = express.Router();

router.post('/register', CreateAdmin);
router.post('/login', LoginAdmin);
router.get('/', LoginAdmin);

module.exports = router;
