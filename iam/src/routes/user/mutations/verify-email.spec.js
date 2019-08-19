const {
  describe, it, before, after, afterEach
} = require('mocha');
const chance = require('chance').Chance();
const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  encryption: {
    userPrivacyData: { secret: encryptionSecret }
  }
} = require('config');
const {
  connectAndCleanUp, cleanUpAndDisconnect, cleanUp, factory
} = require('../../../fixtures');
const app = require('../../../index');
const { encrypt } = require('../../../lib/encryption');

chai.use(chaiHttp);
const { expect } = chai;

describe('Mutation: VerifyEmail', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should return success when email id has been verified', async () => {
    const user = await factory.create('user');

    const response = (await chai
      .request(app)
      .post('/user/mutations/verify_email')
      .send({
        user: encrypt(encryptionSecret, user._id.toString()),
        token: encrypt(encryptionSecret, user.emailVerifyCode.toString())
      })).body;

    expect(response.statusCode).to.equal(200);
    expect(response.message).to.equal('Email id has been verified');
  });

  it('should return error when user is not valid', async () => {
    const user = await factory.create('user');

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/verify_email')
      .send({
        user: chance.string(),
        token: encrypt(encryptionSecret, user.emailVerifyCode.toString())
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('This link has been expired');
  });

  it('should return error when user is not provided', async () => {
    const user = await factory.create('user');

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/verify_email')
      .send({
        token: encrypt(encryptionSecret, user.emailVerifyCode.toString())
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('user is required');
  });

  it('should return error when token is not valid', async () => {
    const user = await factory.create('user');

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/verify_email')
      .send({
        user: encrypt(encryptionSecret, user._id.toString()),
        token: chance.string()
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('This link has been expired');
  });

  it('should return error when token is not provided', async () => {
    const user = await factory.create('user');

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/verify_email')
      .send({
        user: encrypt(encryptionSecret, user._id.toString())
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('token is required');
  });
});
