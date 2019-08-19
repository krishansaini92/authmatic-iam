const { seedData } = require('config');
const mongoose = require('mongoose');
const db = require('../src/db');
const logger = require('../src/services/logger');
const User = require('../src/models/user');

const seedForModel = async (model, documents) => Promise.all(documents.map(async (document) => {
  try {
    await model.create(document);

    logger.info(`Seeded ${model.modelName}: ${document._id}`);
  } catch (err) {
    if (/E11000 duplicate key error/.test(err.message)) {
      logger.info(`Skipping existing ${model.modelName}: ${document._id}`);

      return;
    }

    logger.error(`Failed to seed ${model.modelName}(${document._id}): ${err.message}`);
  }
}));

const seed = async () => {
  try {
    logger.info('Start Seeding IAM data');

    await db.connect();

    await seedForModel(User, seedData.users);

    logger.info('Done seeding IAM data.');
  } catch (error) {
    logger.error(`Failed seeding IAM data.\n${error}`);
  }

  await mongoose.disconnect();
};

if (require.main === module) {
  // eslint-disable-next-line no-process-exit
  seed().then(() => process.exit());
}

module.exports = { seedForModel };