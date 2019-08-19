const express = require('express');
const users = require('./users');
const user = require('./user');

const router = express.Router();

router.use('/', users);
router.use('/', user);

module.exports = router;
