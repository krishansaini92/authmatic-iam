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
      firstName: Joi.string()
        .regex(/^[a-zA-Z ]*$/)
        .min(1)
        .max(50)
        .trim()
        .required(),
      lastName: Joi.string()
        .regex(/^[a-zA-Z ]*$/)
        .min(1)
        .max(50)
        .trim()
        .allow('')
        .optional(),
      email: Joi.string()
        .email()
        .min(2)
        .max(50)
        .trim()
        .allow('')
        .optional(),
      password: Joi.string()
        .min(6)
        .allow('')
        .optional(),
      googleId: Joi.string()
        .min(6)
        .allow('')
        .optional(),
      facebookId: Joi.string()
        .min(6)
        .allow('')
        .optional(),
      phoneNumber: Joi.string()
        .min(5)
        .max(15)
        .trim()
        .allow('')
        .optional(),
      countryCode: Joi.string()
        .min(1)
        .max(4)
        .trim()
        .allow('')
        .optional()
    })
  );

  if (
    error
    && error.details
    && error.details[0]
    && error.details[0].message
    && error.details[0].message.indexOf('fails to match the required pattern') > -1
  ) {
    throw new Error('INVALID_NAME');
  } else if (error) {
    joiFailurePrettier(error);
  }
  if (payload.email && !validator.isEmail(payload.email)) {
    throw new Error('INVALID_EMAIL');
  }

  if (payload.countryCode && !/^\d+$/.test(payload.countryCode)) {
    throw new Error('COUNTRY_CODE_ONLY_NUMBERS');
  }

  if (payload.phoneNumber && !/^\d+$/.test(payload.phoneNumber)) {
    throw new Error('PHONE_NUMBER_ONLY_NUMBER');
  }

  return value;
};

router.post('/signup', async ({ body: payload }, res, next) => {
  try {
    // eslint-disable-next-line no-param-reassign
    payload = validateRequest(payload);

    const dataToSave = {
      email: payload.email ? payload.email.trim() : undefined,
      name: {
        firstName: payload.firstName,
        lastName: payload.lastName
      }
    };
    if (payload.email && payload.password) {
      dataToSave.password = payload.password.trim();
    } else if (payload.facebookId) {
      dataToSave.facebookId = payload.facebookId;
      dataToSave.emailVerified = !!payload.email;
    } else if (payload.googleId) {
      dataToSave.googleId = payload.googleId;
      dataToSave.emailVerified = !!payload.email;
    } else if (payload.phoneNumber && payload.countryCode && payload.password) {
      dataToSave.phone = {
        countryCode: payload.countryCode,
        number: payload.phoneNumber
      };
      dataToSave.password = payload.password.trim();
    } else {
      throw new Error('INVALID_REQUEST_DATA');
    }

    let savedUser;

    try {
      savedUser = await User.create(dataToSave);
    } catch (saveError) {
      if (
        saveError
        && saveError.code === 11000
        && saveError.errmsg
        && saveError.errmsg.indexOf('facebookId_1') > -1
      ) {
        savedUser = await User.findOne({ facebookId: payload.facebookId }).select('facebookId');
      } else if (
        saveError
        && saveError.code === 11000
        && saveError.errmsg
        && saveError.errmsg.indexOf('email_1') > -1
      ) {
        const searchCriteria = {};
        let socialResponse;

        if (payload.facebookId) {
          searchCriteria.facebookId = payload.facebookId;
          socialResponse = await User.findOne(searchCriteria);
        } else if (payload.googleId) {
          searchCriteria.googleId = payload.googleId;
          socialResponse = await User.findOne(searchCriteria);
        } else {
          throw new Error('EMAIL_ALREADY_REGISTERED');
        }

        if (socialResponse) {
          savedUser = socialResponse;
        } else {
          const user = await User.findOne({ email: payload.email });
          savedUser = await User.findOneAndUpdate(
            { _id: user._id },
            {
              faceBookId: payload.facebookId,
              googleId: payload.googleId
            }
          );
        }
      } else if (
        saveError
        && saveError.code === 11000
        && saveError.errmsg
        && saveError.errmsg.indexOf('googleId_1') > -1
      ) {
        savedUser = await User.findOne({ googleId: payload.googleId }).select('googleId');
      } else {
        throw saveError;
      }
    }

    /* Generate session for registered user. */
    const session = await savedUser.createSession();

    const responseUser = await User.findOne({ _id: savedUser._id });

    res.send({
      statusCode: 201,
      user: responseUser,
      session
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
