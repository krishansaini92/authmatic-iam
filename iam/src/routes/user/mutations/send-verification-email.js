const express = require('express');
const Joi = require('joi');
const validator = require('validator');
const User = require('../../../models/user');
const sendVerificationEmail = require('../../../services/send-verification-email');
const { joiFailurePrettier } = require('../../../lib/joi-validate');

const router = express.Router();

const validateRequest = (payload) => {
  const { error, value } = Joi.validate(
    payload,
    Joi.object({
      email: Joi.string()
        .email()
        .trim()
        .required()
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  if (payload.email && !validator.isEmail(payload.email)) {
    throw new Error('INVALID_EMAIL');
  }

  return value;
};

router.post('/send_verification_email', async ({ body: payload, logger }, res, next) => {
  try {
    // eslint-disable-next-line no-param-reassign
    payload = validateRequest(payload);

    const user = await User.findOne({ email: payload.email });

    if (!user) {
      throw new Error('INVALID_EMAIL_SERVER');
    }

    sendVerificationEmail({ user, logger });

    res.send({ statusCode: 200, message: 'Verification Email has been sent to your email id' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
