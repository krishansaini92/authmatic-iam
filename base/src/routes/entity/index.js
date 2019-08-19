const express = require('express');
const mutations = require('./mutations');

const router = express.Router();

router.use('/mutations', mutations);

module.exports = router;
