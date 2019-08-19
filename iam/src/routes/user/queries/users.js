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
      skip: Joi.string()
        .length(24)
        .allow('')
        .trim()
        .optional(),
      limit: Joi.number()
        .min(0)
        .max(1000)
        .optional()
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  return value;
};

router.get('/users', async ({ body: payload, auth }, res, next) => {
  try {
    const { skip, limit = 10 } = validateRequest(payload);
    checkAuthentication(auth, ['admin']);

    const searchCriteria = {};

    if (skip) {
      searchCriteria._id = {
        $lt: skip
      };
    }

    const users = await User.find(searchCriteria, {}, { limit, sort: { _id: -1 } });

    const count = await User.count();

    res.send({
      statusCode: 200,
      data: {
        users,
        count
      },
      message: 'USERS_FETCHED'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
