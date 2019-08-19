const {
  describe, it, before, after, afterEach
} = require('mocha');
const chance = require('chance').Chance();
const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  connectAndCleanUp, cleanUpAndDisconnect, cleanUp, factory
} = require('../../../fixtures');
const app = require('../../../index');

chai.use(chaiHttp);
const { expect } = chai;

describe('Mutation: ForgotPassword', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should return success if email is valid and exists on server', async () => {
    const email = 'krishan@gmail.com';
    await factory.create('user', { email });
    const response = (await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email
      })).body;

    expect(response.statusCode).to.equal(200);
  });

  it('should return success if phone number is valid and exists on server', async () => {
    const user = await factory.create('user');

    const response = (await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: user.phone.number
      })).body;

    expect(response.statusCode).to.equal(200);
  });

  it('should return error if email is not valid', async () => {
    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: 'abc@nnn'
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_REQUEST_DATA');
  });

  it('should return error if phone number is not valid', async () => {
    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: '67'
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_REQUEST_DATA');
  });

  it('should return error if email does not exist on the server', async () => {
    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: chance.email()
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_REQUEST_DATA');
  });

  it('should return error if phone number does not exist on the server', async () => {
    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/forgot_password')
      .send({
        email: chance.phone({ formatted: false })
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_REQUEST_DATA');
  });
});
