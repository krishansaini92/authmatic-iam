const {
  describe, it, before, after, afterEach
} = require('mocha');
const chance = require('chance').Chance();
const chai = require('chai');
const chaiHttp = require('chai-http');
const { connectAndCleanUp, cleanUpAndDisconnect, cleanUp } = require('../../../fixtures');
const app = require('../../../index');

chai.use(chaiHttp);
const { expect } = chai;

describe('Mutation: SignUp', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should be successful when user registers using phone number and password', async () => {
    const payload = {
      firstName: chance.name().split(' ')[0],
      countryCode: '91',
      phoneNumber: chance.phone({ formatted: false }),
      password: chance.string({ length: 6 })
    };
    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
  });

  it('should be successful when user registers using phone number, email and password', async () => {
    const payload = {
      firstName: chance.name().split(' ')[0],
      email: chance.email(),
      countryCode: '91',
      phoneNumber: chance.phone({ formatted: false }),
      password: chance.string({ length: 6 })
    };
    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
  });

  it('should be successful when user registers using email and password', async () => {
    const payload = {
      firstName: chance.name().split(' ')[0],
      email: chance.email(),
      password: chance.string({ length: 6 })
    };
    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
  });

  it('should be successful when user registers using facebook account, if email provided emailVerified must be set true', async () => {
    const facebookId = chance.string({ length: 10 });
    const payload = {
      firstName: chance.name().split(' ')[0],
      email: chance.email(),
      facebookId
    };
    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
    expect(response.user.emailVerified).to.equal(true);
  });

  it('should be successful when user registers using facebook account, if email not provided emailVerified must be set false', async () => {
    const facebookId = chance.string({ length: 10 });
    const payload = {
      firstName: chance.name().split(' ')[0],
      facebookId
    };
    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
    expect(response.user.emailVerified).to.equal(false);
  });

  it('should be successful when registers using google account, if email not provided emailVerified must be set false', async () => {
    const googleId = chance.string({ length: 10 });
    const payload = {
      firstName: chance.name().split(' ')[0],
      googleId
    };
    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
    expect(response.user.emailVerified).to.equal(false);
  });

  it('should be successful when registers using google account, if email provided emailVerified must be set true', async () => {
    const googleId = chance.string({ length: 10 });
    const payload = {
      firstName: chance.name().split(' ')[0],
      email: chance.email(),
      googleId
    };
    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
    expect(response.user.emailVerified).to.equal(true);
  });

  describe('.firstName', () => {
    it('should throw error when firstName is not provided', async () => {
      const googleId = chance.string({ length: 10 });
      const payload = {
        email: chance.email(),
        googleId
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('firstName is required');
    });

    it('should throw error when firstName is not a string', async () => {
      const googleId = chance.string({ length: 10 });
      const payload = {
        firstName: 11,
        email: chance.email(),
        googleId
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('firstName must be a string');
    });

    it('should throw error when firstName is empty', async () => {
      const googleId = chance.string({ length: 10 });
      const payload = {
        firstName: '',
        email: chance.email(),
        googleId
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('firstName is not allowed to be empty');
    });

    it('should throw error when firstName contains special characters', async () => {
      const googleId = chance.string({ length: 10 });
      const payload = {
        firstName: 'A@#$%^&*(m',
        email: chance.email(),
        googleId
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('Name should only contain alphabets and spaces');
    });
  });

  describe('.lastName', () => {
    it('should throw error when lastName is not a string', async () => {
      const googleId = chance.string({ length: 10 });
      const payload = {
        firstName: chance.name().split(' ')[0],
        lastName: 11,
        email: chance.email(),
        googleId
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('lastName must be a string');
    });

    it('should throw error when lastName contains special characters', async () => {
      const googleId = chance.string({ length: 10 });
      const payload = {
        firstName: chance.name().split(' ')[0],
        lastName: 'A@#$%^&*(m',
        email: chance.email(),
        googleId
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('Name should only contain alphabets and spaces');
    });
  });

  describe('.email', () => {
    it('should throw error when email is provided but not valid', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: 'abc@abc',
        password: chance.string({ length: 6 })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('email must be a valid email');
    });

    it('should throw error if email id already exists on the server', async () => {
      const email = chance.email();
      const payload = {
        firstName: chance.name().split(' ')[0],
        email,
        password: chance.string({ length: 6 })
      };

      await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload);

      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.error).to.equal('EMAIL_ALREADY_REGISTERED');
    });

    it('should throw error when email is provided but facebookId googleId and password is not provided', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: chance.email()
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.error).to.equal('INVALID_REQUEST_DATA');
    });

    it('should throw error when email and password are provided but password is not valid', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: chance.email(),
        password: chance.string({ length: 5 })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('password length must be at least 6 characters long');
    });
  });

  describe('.phone', () => {
    it('should throw error when phoneNumber is provided but contains alphabets and special characters', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        countryCode: '91',
        phoneNumber: chance.string({ length: 10 }),
        password: chance.string({ length: 6 })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('Phone Number must contain numbers only');
    });

    it('should throw error when phoneNumber is provided but not a string', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        countryCode: '91',
        phoneNumber: 111111,
        password: chance.string({ length: 6 })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('phoneNumber must be a string');
    });

    it('should throw error when phoneNumber is provided but countryCode is not provided', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        phoneNumber: chance.phone({ formatted: false }),
        password: chance.string({ length: 6 })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.error).to.equal('INVALID_REQUEST_DATA');
    });

    it('should throw error when phoneNumber and countryCode are provided but facebookId googleId and password is not provided', async () => {
      const payload = {
        countryCode: '91',
        firstName: chance.name().split(' ')[0],
        phoneNumber: chance.phone({ formatted: false })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.error).to.equal('INVALID_REQUEST_DATA');
    });
  });

  describe('.countryCode', () => {
    it('should throw error when countryCode is provided but not a string', async () => {
      const payload = {
        countryCode: 91,
        firstName: chance.name().split(' ')[0],
        phoneNumber: chance.phone({ formatted: false })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('countryCode must be a string');
    });

    it('should throw error when countryCode is provided but contains alphabets or special characters', async () => {
      const payload = {
        countryCode: 91,
        firstName: chance.name().split(' ')[0],
        phoneNumber: chance.phone({ formatted: false })
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('countryCode must be a string');
    });
  });

  describe('.session', () => {
    it('should return valid accessToken and refreshToken of the same user when registration is successful using email', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: chance.email(),
        password: chance.string({ length: 6 })
      };
      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
      expect(response.session).to.contain.keys('accessToken', 'refreshToken');
    });

    it('should return valid accessToken and refreshToken of the same user when registration is successful using phoneNumber', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        countryCode: '91',
        phoneNumber: chance.phone({ formatted: false }),
        password: chance.string({ length: 6 })
      };
      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
      expect(response.session).to.contain.keys('accessToken', 'refreshToken');
    });

    it('should return valid accessToken and refreshToken of the same user when registration is successful using facebook Account', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: chance.email(),
        facebookId: chance.string({ length: 10 })
      };
      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
      expect(response.session).to.contain.keys('accessToken', 'refreshToken');
    });

    it('should return valid accessToken and refreshToken of the same user when registration is successful using google account', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: chance.email(),
        googleId: chance.string({ length: 10 })
      };
      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
      expect(response.session).to.contain.keys('accessToken', 'refreshToken');
    });
  });

  describe('.googleId', () => {
    it('should throw error when googleId is provided but not valid', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        googleId: '#4.'
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('googleId length must be at least 6 characters long');
    });

    it('should not throw error when googleId already exists with email on the server', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: chance.email(),
        googleId: chance.string({ length: 10 })
      };

      await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload);

      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
    });

    it('should not throw error when googleId already exists without email on the server', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        googleId: chance.string({ length: 10 })
      };

      await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload);

      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
    });
  });

  describe('.facebookId', () => {
    it('should throw error when facebookId is provided but not valid', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        facebookId: '#45.'
      };
      const response = JSON.parse((await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).error.text);

      expect(response.statusCode).to.equal(400);
      expect(response.message).to.equal('facebookId length must be at least 6 characters long');
    });

    it('should not throw error when facebookId already exists with email on the server', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        email: chance.email(),
        facebookId: chance.string({ length: 10 })
      };

      await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload);

      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
    });

    it('should not throw error when facebookId already exists without email on the server', async () => {
      const payload = {
        firstName: chance.name().split(' ')[0],
        facebookId: chance.string({ length: 10 })
      };

      await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload);

      const response = (await chai
        .request(app)
        .post('/user/mutations/signup')
        .send(payload)).body;

      expect(response.statusCode).to.equal(201);
    });
  });

  it('should return true when user tried to login using social account but he is already registered using email', async () => {
    const email = chance.email();
    const emailSignupPayload = {
      firstName: chance.name().split(' ')[0],
      email,
      password: chance.string({ length: 6 })
    };
    await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(emailSignupPayload);

    const payload = {
      firstName: chance.name().split(' ')[0],
      email,
      facebookId: chance.string({ length: 10 })
    };

    const response = (await chai
      .request(app)
      .post('/user/mutations/signup')
      .send(payload)).body;

    expect(response.statusCode).to.equal(201);
  });
});
