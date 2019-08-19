const {
  describe, it, before, after, afterEach
} = require('mocha');
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

describe('Query: Users', () => {
  before(connectAndCleanUp);
  afterEach(cleanUp);
  after(cleanUpAndDisconnect);

  it('should fetch users successfully', async () => {
    await factory.createMany('user', 15);

    const bearerToken = await createBearerToken({}, 'admin');
    const response = (await chai
      .request(app)
      .get('/user/queries/users')
      .set({ authorization: bearerToken })
      .send({
        limit: 15
      })).body;

    expect(response.data.users.length).to.equal(15);
    expect(response.data.count).to.equal(15);
  });

  it('should throw error when user is not authenticated', async () => {
    const response = (await chai
      .request(app)
      .get('/user/queries/users')
      .send({
        limit: 10
      })).body;

    expect(response.statusCode).to.equal(401);
  });

  it('should throw error when authenticated user is not admin', async () => {
    const bearerToken = await createBearerToken();

    const response = (await chai
      .request(app)
      .get('/user/queries/users')
      .set({ authorization: bearerToken })
      .send({
        limit: 10
      })).body;

    expect(response.statusCode).to.equal(401);
  });

  it('should fetch only first 10 users when arguement limit = 10 and skip = "" ', async () => {
    await factory.createMany('user', 15);
    const bearerToken = await createBearerToken({}, 'admin');

    const response = (await chai
      .request(app)
      .get('/user/queries/users')
      .set({ authorization: bearerToken })
      .send({
        skip: '',
        limit: 10
      })).body;

    expect(response.data.users.length).to.equal(10);
    expect(response.data.count).to.equal(15);
  });

  it('should fetch results as per pagination', async () => {
    await factory.createMany('user', 30);
    const bearerToken = await createBearerToken({}, 'admin');

    let skip = '';
    let fetchedUsersCount = 0;
    let fetchedAllUsers = true;

    while (fetchedAllUsers) {
      // eslint-disable-next-line no-await-in-loop
      const response = (await chai
        .request(app)
        .get('/user/queries/users')
        .set({ authorization: bearerToken })
        .send({
          skip,
          limit: 10
        })).body;

      expect(response.data.users.length).to.equal(10);

      fetchedUsersCount += response.data.users.length;

      skip = response.data.users.pop()._id;

      if (fetchedUsersCount === response.data.count) {
        fetchedAllUsers = false;
      }
    }
  });
});
