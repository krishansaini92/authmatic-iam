const express = require('express');
const Joi = require('joi');
const {
  encryption: {
    userPrivacyData: { secret: decryptionSecret }
  }
} = require('config');
const User = require('../../../models/user');
const { joiFailurePrettier } = require('../../../lib/joi-validate');
const { decrypt } = require('../../../lib/encryption');

const router = express.Router();

const validateRequest = (payload) => {
  const { error, value } = Joi.validate(
    payload,
    Joi.object({
      user: Joi.string()
        .trim()
        .required(),
      token: Joi.string()
        .trim()
        .required()
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  return value;
};

router.post('/verify_email', async ({ body: payload, logger }, res, next) => {
  try {
    // eslint-disable-next-line no-param-reassign
    const { token, user: encryptedUserId } = validateRequest(payload);

    let userId;
    let emailVerifyCode;

    try {
      userId = decrypt(decryptionSecret, encryptedUserId);
      emailVerifyCode = decrypt(decryptionSecret, token);
    } catch (e) {
      logger.error('Error while decryption payload:', e);
      throw new Error('LINK_EXPIRED');
    }
    const user = await User.findOne({ _id: userId, emailVerifyCode });

    if (!user) {
      logger.error('Invalid user id provided');
      throw new Error('LINK_EXPIRED');
    }

    await User.updateOne(
      { _id: userId },
      { $set: { emailVerified: true }, $unset: { emailVerifyCode: 1 } }
    );

    res.send({ statusCode: 200, message: 'Email id has been verified' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
