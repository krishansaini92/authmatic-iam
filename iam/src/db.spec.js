const { describe, it, afterEach } = require('mocha');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { disconnectDb } = require('./fixtures');
const db = require('./db');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('DB', () => {
  afterEach(disconnectDb);

  it('should connect to database', async () => {
    await expect(db.connect()).to.be.fulfilled;
  });
});
