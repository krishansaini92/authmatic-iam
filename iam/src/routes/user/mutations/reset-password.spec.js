const {
  describe, it, before, after, afterEach
} = require('mocha');
const { encryption } = require('config');
const chance = require('chance').Chance();
const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  connectAndCleanUp, cleanUpAndDisconnect, cleanUp, factory
} = require('../../../fixtures');
const app = require('../../../index');
const User = require('../../../models/user');
const { encrypt } = require('../../../lib/encryption');

chai.use(chaiHttp);
const { expect } = chai;

describe('Mutation: ResetPassword', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should return success password has been updated successfully', async () => {
    let user = await factory.create('user');
    await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.email
      });

    user = await User.findOne({ _id: user._id });

    const newPassword = chance.string({ length: 10 });

    const response = (await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: encrypt(encryption.get('userPrivacyData.secret'), user._id.toString()),
        token: user.resetPassword.code,
        password: newPassword
      })).body;

    expect(response.statusCode).to.equal(200);
    expect(response.message).to.equal('Password has been updated. Please login');

    const signInResponse = (await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: user.email,
        password: newPassword
      })).body;

    expect(signInResponse.statusCode).to.equal(200);
  });

  it('should return error if userId is incorrect', async () => {
    let user = await factory.create('user');
    await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.email
      });
    user = await User.findOne({ _id: user._id });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: user._id,
        token: user.resetPassword.code,
        password: chance.string({ length: 10 })
      })).error.text);

    expect(response.error).to.equal('LINK_EXPIRED');
  });

  it('should return error if token is invalid', async () => {
    let user = await factory.create('user');
    await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.email
      });
    user = await User.findOne({ _id: user._id });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: user._id,
        token: chance.string(),
        password: chance.string({ length: 10 })
      })).error.text);

    expect(response.message).to.equal('token length must be 4 characters long');
  });

  it('should return error if token does not match the one on server', async () => {
    let user = await factory.create('user');
    await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.email
      });
    user = await User.findOne({ _id: user._id });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: user._id,
        token: chance.string({ length: 4 }),
        password: chance.string({ length: 10 })
      })).error.text);

    expect(response.error).to.equal('LINK_EXPIRED');
  });

  it('should return error if password is invalid', async () => {
    let user = await factory.create('user');
    await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.email
      });
    user = await User.findOne({ _id: user._id });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: user._id,
        token: user.resetPassword.code,
        password: chance.string({ length: 4 })
      })).error.text);

    expect(response.message).to.equal('password length must be at least 6 characters long');
  });

  it('should return error if link had already been used once', async () => {
    let user = await factory.create('user');
    await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.email
      });

    user = await User.findOne({ _id: user._id });
    const newPassword = chance.string({ length: 10 });

    await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: encrypt(encryption.get('userPrivacyData.secret'), user._id.toString()),
        token: user.resetPassword.code,
        password: newPassword
      });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: encrypt(encryption.get('userPrivacyData.secret'), user._id.toString()),
        token: user.resetPassword.code,
        password: newPassword
      })).error.text);

    expect(response.error).to.equal('LINK_EXPIRED');
  });

  it('should throw error if time to update password has been lapsed', async () => {
    const timeout = async (timeInMilliSeconds) => new Promise((res) => {
      setTimeout(() => {
        res();
      }, timeInMilliSeconds);
    });

    let user = await factory.create('user');

    await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.email
      });

    user = await User.findOne({ _id: user._id });

    const newPassword = chance.string({ length: 10 });

    await timeout(3002);

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/reset_password')
      .send({
        user: encrypt(encryption.get('userPrivacyData.secret'), user._id.toString()),
        token: user.resetPassword.code,
        password: newPassword
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('LINK_EXPIRED');
  });
});
