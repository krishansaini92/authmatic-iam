const express = require('express');
const Joi = require('joi');
const ms = require('ms');
const validator = require('validator');
const { resetPassword } = require('config');
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
        .required()
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  return value;
};

router.post('/forgot_password', async ({ body: payload }, res, next) => {
  try {
    // eslint-disable-next-line no-param-reassign
    const { email } = validateRequest(payload);

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
      throw new Error('INVALID_REQUEST_DATA');
    }

    try {
      const user = await User.findOne(findCriteria);
      const forgotToken = (Math.floor(Math.random() * 9999) + 1111).toString().substr(0, 4);
      await User.findOneAndUpdate(
        {
          _id: user._id
        },
        {
          $set: {
            'resetPassword.code': forgotToken,
            'resetPassword.validTill': new Date().getTime() + ms(resetPassword.get('expiryTtl'))
          }
        }
      );
    } catch (e) {
      throw new Error('INVALID_REQUEST_DATA');
    }

    res.send({
      statusCode: 200,
      message: 'Reset password details has been sent on your Email / Phone'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
