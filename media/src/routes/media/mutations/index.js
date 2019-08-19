const express = require('express');
const cropUpload = require('./crop-upload');

const router = express.Router();

router.use('/', cropUpload);

module.exports = router;
