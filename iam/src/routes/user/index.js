const express = require('express');
const queries = require('./queries');
const mutations = require('./mutations');

const router = express.Router();

router.use('/queries', queries);
router.use('/mutations', mutations);

module.exports = router;
