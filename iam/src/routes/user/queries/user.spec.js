const {
  describe, it, before, after, afterEach
} = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chance = require('chance').Chance();
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

describe('Query: Users', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should fetch user when id is provided', async () => {
    await factory.createMany('user', 2);

    const user = await factory.create('user');

    await factory.createMany('user', 2);

    const bearerToken = await createBearerToken();
    const response = (await chai
      .request(app)
      .get('/user/queries/user')
      .set({ authorization: bearerToken })
      .send({
        id: String(user._id)
      })).body;

    expect(response.data.user._id).to.equal(String(user._id));
  });

  it('should throw error when id is not provided', async () => {
    const bearerToken = await createBearerToken();
    const response = (await chai
      .request(app)
      .get('/user/queries/user')
      .set({ authorization: bearerToken })
      .send()).body;

    expect(response.statusCode).to.equal(400);
    expect(response.message).to.equal('id is required');
  });

  it('should throw error when user is not authenticated', async () => {
    const response = (await chai
      .request(app)
      .get('/user/queries/user')
      .send({
        id: chance.string({ length: 24 })
      })).body;

    expect(response.statusCode).to.equal(401);
    expect(response.message).to.equal('Authentication failed');
  });

  it('should fetch user when user is authenticated as admin', async () => {
    await factory.createMany('user', 2);

    const user = await factory.create('user');

    await factory.createMany('user', 2);

    const bearerToken = await createBearerToken({}, 'admin');
    const response = (await chai
      .request(app)
      .get('/user/queries/user')
      .set({ authorization: bearerToken })
      .send({
        id: String(user._id)
      })).body;

    expect(response.data.user._id).to.equal(String(user._id));
  });
});
