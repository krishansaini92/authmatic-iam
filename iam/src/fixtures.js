const mongoose = require('mongoose');
const chance = require('chance').Chance();
const { factory, MongooseAdapter } = require('factory-girl');
const { ObjectId } = require('mongoose').Types;
const db = require('./db');
const User = require('./models/user');
const createAccessToken = require('./lib/create-jwt-token');

factory.setAdapter(new MongooseAdapter());

factory.define('user', User, {
  name: {
    firstName: chance.name().split(' ')[0],
    lastName: chance.name().split(' ')[1]
  },
  phone: {
    countryCode: '91',
    number: factory.chance('phone', { formatted: false }),
    isVerified: false,
    verifyOTP: (Math.floor(Math.random() * 9999) + 1111).toString().substr(0, 4)
  },
  email: factory.chance('email'),
  password: factory.chance('string', { length: 6 }),
  facebookId: factory.chance('string', { length: 10 }),
  googleId: factory.chance('string', { length: 10 }),
  emailVerified: false,
  emailVerifyCode: (Math.floor(Math.random() * 9999) + 1111).toString().substr(0, 4)
});

const connectDb = async () => db.connect();

const cleanUp = async () => {
  await factory.cleanUp();

  await User.deleteMany();
};

const disconnectDb = () => mongoose.disconnect();

const connectAndCleanUp = async () => {
  await connectDb();
  await cleanUp();
};

const cleanUpAndDisconnect = async () => {
  await cleanUp();
  await disconnectDb();
};

// Makes sure the documents get inserted in sequential order.
// Useful for tests that checks sequence of present documents
const createInSequence = async (entityName, patchFunc, count = 10) => {
  if (typeof patchFunc === 'number' && !count) {
    count = patchFunc; // eslint-disable-line no-param-reassign
  }

  for (let i = 1; i <= count; i += 1) {
    const patch = typeof patchFunc === 'function' ? patchFunc(i) : {};
    await factory.create(entityName, patch); // eslint-disable-line no-await-in-loop
  }
};

const createBearerToken = async (data = {}, role = 'user') => {
  const dataToEncode = {};
  // eslint-disable-next-line security/detect-object-injection
  dataToEncode[role] = {
    id: ObjectId(),
    ...data
  };
  const accessToken = await createAccessToken(dataToEncode);

  return `Bearer ${accessToken}`;
};

module.exports = {
  factory,
  connectDb,
  cleanUp,
  disconnectDb,
  connectAndCleanUp,
  cleanUpAndDisconnect,
  createInSequence,
  createBearerToken
};
