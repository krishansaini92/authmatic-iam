const express = require('express');
const Joi = require('joi');
const { encryption } = require('config');
const User = require('../../../models/user');
const { decrypt } = require('../../../lib/encryption');
const { joiFailurePrettier } = require('../../../lib/joi-validate');

const router = express.Router();

const validateRequest = (payload) => {
  const { error, value } = Joi.validate(
    payload,
    Joi.object({
      user: Joi.string()
        .trim()
        .required(),
      token: Joi.string()
        .length(4)
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

router.post('/reset_password', async ({ body: payload }, res, next) => {
  try {
    // eslint-disable-next-line no-param-reassign
    const { user: encryptedUserId, password, token } = validateRequest(payload);

    try {
      const userId = decrypt(encryption.get('userPrivacyData.secret'), encryptedUserId);
      const user = await User.findOne({
        _id: userId,
        'resetPassword.code': token,
        'resetPassword.validTill': {
          $gte: new Date()
        }
      });
      await User.updateOne({ _id: user._id }, { $set: { password }, $unset: { resetPassword: 1 } });
    } catch (e) {
      throw new Error('LINK_EXPIRED');
    }

    res.send({ statusCode: 200, message: 'Password has been updated. Please login' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
