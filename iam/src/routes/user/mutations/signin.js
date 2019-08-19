const express = require('express');
const Joi = require('joi');
const validator = require('validator');
const User = require('../../../models/user');
const { joiFailurePrettier } = require('../../../lib/joi-validate');

const router = express.Router();

const validateRequest = (payload) => {
  const { error, value } = Joi.validate(
    payload,
    Joi.object({
      email: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required(),
      password: Joi.string()
        .min(6)
        .required()
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  return value;
};

router.post('/signin', async ({ body: payload }, res, next) => {
  try {
    const { email, password } = validateRequest(payload);

    let findCriteria = {};

    if (email && validator.isEmail(email)) {
      findCriteria = {
        email
      };
    } else if (email && validator.isNumeric(email)) {
      findCriteria = {
        'phone.number': email
      };
    } else {
      throw new Error('INVALID_EMAIL_PHONE');
    }

    const userToGet = await User.findOne(findCriteria).select('password');

    if (!userToGet) {
      throw new Error('INVALID_EMAIL_PHONE');
    }

    const passwordMatched = await userToGet.comparePassword(password.toString().trim());
    if (!passwordMatched) {
      throw new Error('INVALID_CREDENTIALS');
    }

    /* Generate access token for logged in user. */
    const session = await userToGet.createSession();

    const responseUser = await User.findOne({ _id: userToGet._id });

    res.send({ statusCode: 200, user: responseUser, session });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
