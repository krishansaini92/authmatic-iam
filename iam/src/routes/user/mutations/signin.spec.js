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

describe('Mutation: SignIn', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should be able to sign in successfully using email and password', async () => {
    const userDetails = {
      email: chance.email(),
      password: chance.string({ length: 6 })
    };
    await factory.create('user', {
      password: userDetails.password,
      email: userDetails.email
    });

    const response = (await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: userDetails.email,
        password: userDetails.password
      })).body;

    expect(response.statusCode).to.equal(200);
  });

  it('should be able to signin successfully using phone and password', async () => {
    const userDetails = {
      countryCode: '91',
      phoneNumber: chance.phone({ formatted: false }),
      password: chance.string({ length: 6 })
    };
    await factory.create('user', {
      password: userDetails.password,
      phone: {
        number: userDetails.phoneNumber,
        countryCode: userDetails.countryCode
      }
    });

    const response = (await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: userDetails.phoneNumber,
        password: userDetails.password
      })).body;

    expect(response.statusCode).to.equal(200);
  });

  it('should throw error when email is not valid', async () => {
    const userDetails = {
      email: 'Hello',
      password: chance.string({ length: 6 })
    };
    await factory.create('user', {
      password: userDetails.password,
      email: userDetails.email
    });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: userDetails.email,
        password: userDetails.password
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_EMAIL_PHONE');
  });

  it('should throw error when phone is not valid', async () => {
    const userDetails = {
      countryCode: '91',
      phoneNumber: chance.phone({ formatted: false }),
      password: chance.string({ length: 6 })
    };
    await factory.create('user', {
      password: userDetails.password,
      phone: {
        number: userDetails.phoneNumber,
        countryCode: userDetails.countryCode
      }
    });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: 'Hello test',
        password: userDetails.password
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_EMAIL_PHONE');
  });

  it('should throw error when email and password do not match', async () => {
    const userDetails = {
      email: chance.email(),
      password: chance.string({ length: 6 })
    };
    await factory.create('user', {
      password: userDetails.password,
      email: userDetails.email
    });

    const response = JSON.parse((await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: userDetails.email,
        password: 'Random'
      })).error.text);

    expect(response.statusCode).to.equal(400);
    expect(response.error).to.equal('INVALID_CREDENTIALS');
  });

  it('should return valid session in response', async () => {
    const userDetails = {
      email: chance.email(),
      password: chance.string({ length: 6 })
    };
    await factory.create('user', {
      password: userDetails.password,
      email: userDetails.email
    });

    const response = (await chai
      .request(app)
      .post('/user/mutations/signin')
      .send({
        email: userDetails.email,
        password: userDetails.password
      })).body;

    expect(response.statusCode).to.equal(200);
    expect(response.session).to.contain.keys('accessToken', 'refreshToken');
  });
});
