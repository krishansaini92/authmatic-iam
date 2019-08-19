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

describe('Mutation: SendVerificationEmail', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should return success when verification email is sent successfully', async () => {
    const user = await factory.create('user');

    const response = (await chai
      .request(app)
      .post('/user/mutations/send_verification_email')
      .send({
        email: user.email
      })).body;

    expect(response.statusCode).to.equal(200);
    expect(response.message).to.equal('Verification Email has been sent to your email id');
  });

  it('should return error when email id is invalid', async () => {
    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/send_verification_email')
      .send({
        email: chance.string()
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('email must be a valid email');
  });

  it('should return error when email id does not exist on the server', async () => {
    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/send_verification_email')
      .send({
        email: chance.email()
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('Email id does not exist in our database');
  });
});
