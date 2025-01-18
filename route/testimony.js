const express = require('express');
const { CreateTestimony, GetTestimony } = require('../controllers/testimony');
const { GeneratePdf } = require('../controllers/generatedPdf');
const router = express.Router();

router.route('/').get(GetTestimony).post(CreateTestimony);
router.route('/download').post(GeneratePdf);

module.exports = router;
