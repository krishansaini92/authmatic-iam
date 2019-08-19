const mongoose = require('mongoose');
const softDeletePlugin = require('mongoose-delete');
const chance = require('chance').Chance();
const {
  describe, it, before, beforeEach, after
} = require('mocha');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { disconnectDb, connectDb } = require('../src/fixtures');
const { seedForModel } = require('./index');

chai.use(chaiAsPromised);

const { expect } = chai;

const SeedModelSchema = new mongoose.Schema({
  name: String
});

SeedModelSchema.plugin(softDeletePlugin, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
});

const SeedModel = mongoose.model('SeedModel', SeedModelSchema);

describe('Seed: Accounts', () => {
  before(connectDb);
  after(async () => {
    await SeedModel.deleteMany({});
    await disconnectDb();
  });
  beforeEach(async () => {
    await SeedModel.deleteMany({});
  });

  describe('.seedForModel', () => {
    it('should add documents with provided _id and not create new _ids for documents', async () => {
      const data = [
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() },
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() }
      ];

      await seedForModel(SeedModel, data);

      const savedDocuments = (await SeedModel.find()).map((doc) => {
        return {
          _id: String(doc._id),
          name: doc.name
        };
      });

      expect(savedDocuments).to.deep.contain.members(data);
    });

    it('should leave documents in db with same _ids untouched', async () => {
      const existingDoc = await SeedModel.create({ name: chance.string() });
      const data = [
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() },
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() },
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() },
        { _id: String(existingDoc.id), name: chance.string() }
      ];

      await seedForModel(SeedModel, data);

      expect(await SeedModel.countDocuments({})).to.be.equal(4);
      expect((await SeedModel.findById(existingDoc.id)).name).to.be.equal(existingDoc.name);
    });

    it('should not re-create deleted documents in database', async () => {
      const data = [
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() },
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() },
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() },
        { _id: String(mongoose.Types.ObjectId()), name: chance.string() }
      ];

      await seedForModel(SeedModel, data);
      expect(await SeedModel.countDocuments()).to.be.equal(4);

      await (await SeedModel.findOne()).delete();
      // FIXME: Model.countDocuments() count the deleted documents as well. We
      // will probably need to fix this in the mongoose soft-delete-plugin
      expect(await SeedModel.count()).to.be.equal(3);

      await seedForModel(SeedModel, data);
      expect(await SeedModel.count()).to.be.equal(3);
    });
  });
});