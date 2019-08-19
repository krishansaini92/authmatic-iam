const {
  describe, it, before, after, afterEach
} = require('mocha');
const chance = require('chance').Chance();
const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  connectAndCleanUp,
  cleanUpAndDisconnect,
  cleanUp,
  factory,
  createBearerToken
} = require('../../../fixtures');
const app = require('../../../index');

chai.use(chaiHttp);
const { expect } = chai;

describe('Mutation: ChangePassword', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should successfully change user password', async () => {
    const oldPassword = chance.string({ length: 6 });
    const newPassword = chance.string({ length: 6 });
    const user = await factory.create('user', { password: oldPassword });

    const bearerToken = await createBearerToken({ id: user._id });

    const response = (await chai
      .request(app)
      .post('/user/mutations/change_password')
      .set({ authorization: bearerToken })
      .send({
        oldPassword,
        newPassword
      })).body;

    expect(response.statusCode).to.equal(200);
    expect(response.message).to.equal('Password has been changed');

    const signInResponse = (await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: user.email,
        password: newPassword
      })).body;

    expect(signInResponse.statusCode).to.equal(200);
  });

  it('should return error when old password is incorrect', async () => {
    const newPassword = chance.string({ length: 6 });

    const user = await factory.create('user');

    const bearerToken = await createBearerToken({ id: user._id });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/change_password')
      .set({ authorization: bearerToken })
      .send({
        oldPassword: chance.string(),
        newPassword
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_OLD_PASSWORD');
  });

  it('should return error when newPassword is invalid', async () => {
    const oldPassword = chance.string({ length: 6 });
    const newPassword = chance.string({ length: 4 });
    const user = await factory.create('user', { password: oldPassword });

    const bearerToken = await createBearerToken({ id: user._id });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/change_password')
      .set({ authorization: bearerToken })
      .send({
        oldPassword,
        newPassword
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('newPassword length must be at least 6 characters long');
  });

  it('should return error when user authentication is not provided', async () => {
    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/change_password')
      .send({
        oldPassword: chance.string(),
        newPassword: chance.string()
      })).error.text);

    expect(response.statusCode).to.equal(401);
    expect(response.error).to.equal('AUTHENTICATION_FAILED');
  });

  it('should return error when user authentication is provided with invalid role', async () => {
    const oldPassword = chance.string({ length: 6 });
    const newPassword = chance.string({ length: 6 });
    const user = await factory.create('user', { password: oldPassword });

    const bearerToken = await createBearerToken({ id: user._id }, 'admin');

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/change_password')
      .set({ authorization: bearerToken })
      .send({
        oldPassword,
        newPassword
      })).error.text);

    expect(response.statusCode).to.equal(401);
    expect(response.error).to.equal('AUTHENTICATION_FAILED');
  });
});
