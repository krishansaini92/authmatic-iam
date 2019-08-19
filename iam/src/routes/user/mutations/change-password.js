const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require('../../../models/user');
const checkAuthentication = require('../../../lib/check-authentication');
const { joiFailurePrettier } = require('../../../lib/joi-validate');

const router = express.Router();

const validateRequest = (payload) => {
  const { error, value } = Joi.validate(
    payload,
    Joi.object({
      oldPassword: Joi.string()
        .min(6)
        .required(),
      newPassword: Joi.string()
        .min(6)
        .required()
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  return value;
};

router.post('/change_password', async ({ body: payload, auth }, res, next) => {
  try {
    checkAuthentication(auth, ['user']);
    const { oldPassword, newPassword } = validateRequest(payload);

    const user = await User.findOne({ _id: auth.user.id }).select('password');

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    console.log('valid password: ', validPassword);
    if (!validPassword) {
      throw new Error('INVALID_OLD_PASSWORD');
    }

    await User.updateOne(
      { _id: auth.user.id },
      {
        $set: {
          password: newPassword
        }
      }
    );

    res.send({ statusCode: 200, message: 'Password has been changed' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
