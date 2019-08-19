const { Schema, model } = require('mongoose');
const ms = require('ms');
const softDeletePlugin = require('mongoose-delete');
const { session: sessionConfig } = require('config');
const randToken = require('rand-token');

const RefreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    token: { type: String, index: true },
    validTill: {
      type: Date
    }
  },
  { timestamps: true }
);

RefreshTokenSchema.virtual('isValid').get(function isRefreshTokenValid() {
  return Math.floor(this.validTill.getTime() - new Date().getTime()) / 1000 > 0;
});

RefreshTokenSchema.pre('save', async function preSaveRefreshToken() {
  if (this.isNew) {
    this.validTill = this.validTill || new Date().getTime() + ms(sessionConfig.get('expiryTtl'));
    this.token = this.model('RefreshToken').createToken();
  }
});

RefreshTokenSchema.methods.extendTtl = async function extendTtl() {
  const validTill = new Date().getTime() + ms(sessionConfig.get('expiryTtl'));

  return this.model('RefreshToken').findOneAndUpdate(
    { _id: this._id },
    { $set: { validTill } },
    { new: true }
  );
};

RefreshTokenSchema.methods.invalidate = async function invalidate() {
  this.validTill = new Date();

  return this.save();
};

RefreshTokenSchema.methods.updateRefreshToken = async function updateRefreshToken() {
  const refreshToken = this.model('RefreshToken').createToken();
  await this.model('RefreshToken').updateOne({ _id: this._id }, { $set: { token: refreshToken } });

  return refreshToken;
};

RefreshTokenSchema.statics.createToken = function createToken() {
  return randToken.uid(256);
};

RefreshTokenSchema.plugin(softDeletePlugin, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
});

module.exports = model('RefreshToken', RefreshTokenSchema);
