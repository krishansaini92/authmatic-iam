const express = require('express');
const signUp = require('./signup');
const signIn = require('./signin');
const forgotPassword = require('./forgot-password');
const resetPassword = require('./reset-password');
const changePassword = require('./change-password');
const sendVerificationEmail = require('./send-verification-email');
const verifyEmail = require('./verify-email');
const updatePhoto = require('./update-photo');

const router = express.Router();

router.use('/', signUp);
router.use('/', signIn);
router.use('/', forgotPassword);
router.use('/', resetPassword);
router.use('/', changePassword);
router.use('/', sendVerificationEmail);
router.use('/', verifyEmail);
router.use('/', updatePhoto);

module.exports = router;
