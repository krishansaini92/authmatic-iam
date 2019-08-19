const express = require('express');
const Joi = require('joi');
const { joiFailurePrettier } = require('../../../lib/joi-validate');
const User = require('../../../models/user');
const checkAuthentication = require('../../../lib/check-authentication');

const router = express.Router();

const validateRequest = (payload) => {
  const { error, value } = Joi.validate(
    payload,
    Joi.object({
      id: Joi.string()
        .length(24)
        .trim()
        .required()
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  return value;
};

router.get('/user', async ({ body: payload, auth }, res, next) => {
  try {
    const { id } = validateRequest(payload);
    checkAuthentication(auth, ['user', 'admin']);

    const user = await User.findOne({
      _id: id
    });

    res.send({
      statusCode: 200,
      data: {
        user
      },
      message: 'USER_FETCHED'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
