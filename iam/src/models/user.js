const mongoose = require('mongoose');
require('mongoose-geojson-schema'); // eslint-disable-line import/no-unassigned-import
const softDeletePlugin = require('mongoose-delete');
const bcrypt = require('bcryptjs');
const { encryption, templates: emailTemplates } = require('config');
const createAccessToken = require('../lib/create-jwt-token');
const { sendEmail } = require('../services/send-email');
const { sendSMS } = require('../services/send-sms');
const { encrypt } = require('../lib/encryption');
const RefreshToken = require('./refresh-token');

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      firstName: { type: String, index: true },
      lastName: { type: String, index: true }
    },
    phone: {
      countryCode: { type: String, index: true, sparse: true },
      number: { type: String, index: true, sparse: true },
      isVerified: { type: Boolean, default: false },
      verifyOTP: {
        type: String,
        default: (Math.floor(Math.random() * 9999) + 1111).toString().substr(0, 4),
        select: false
      }
    },
    email: {
      type: String,
      email: true,
      unique: true,
      sparse: true
    },
    location: {
      country: { type: String, index: true },
      city: { type: String, index: true },
      coordinates: {
        type: mongoose.Schema.Types.Point
      }
    },
    password: { type: String, select: false },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
      select: false
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      select: false
    },
    emailVerified: { type: Boolean, default: false },
    emailVerifyCode: {
      type: String,
      default: (Math.floor(Math.random() * 9999) + 1111).toString().substr(0, 4),
      select: false
    },
    resetPassword: {
      code: { type: String },
      validTill: { type: Date },
      select: false
    },
    photo: {
      _100x100: { type: String },
      _200x200: { type: String },
      _400x400: { type: String },
      _600x600: { type: String },
      _1000x1000: { type: String }
    },
    isAdmin: {
      type: Boolean, default: false
    }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, googleId: 1, facebookId: 1 }, { unique: true });
UserSchema.index({ 'phone.countryCode': 1, 'phone.number': 1 }, { unique: true });

UserSchema.pre('save', async function encryptPassword(next) {
  this.wasNew = this.isNew;
  if (this.password && this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.post('save', async function encryptPassword() {
  if (this.email && (this.isModified('email') || this.wasNew)) {
    sendEmail(emailTemplates.get('emails.verifyEmail'), this.email, {
      id: encrypt(encryption.get('userPrivacyData.secret'), this._id.toString()),
      emailVerifyCode: encrypt(
        encryption.get('userPrivacyData.secret'),
        this.emailVerifyCode.toString()
      )
    });
  }
  if (this.phone && this.phone.number && (this.isModified('phone') || this.wasNew)) {
    sendSMS(emailTemplates.get('phone.verifyPhone'), this.phone.countryCode + this.phone.number, {
      otp: this.phone.verifyOTP
    });
  }
});

function updatePassword(next) {
  if (this && this._update && this._update.$set && this._update.$set.password) {
    bcrypt.hash(this._update.$set.password, 10, (err, hash) => {
      this._update.$set.password = hash;
      next();
    });
  } else {
    next();
  }
}

UserSchema.pre('findOneAndUpdate', updatePassword);
UserSchema.pre('update', updatePassword);
UserSchema.pre('updateOne', updatePassword);
UserSchema.pre('updateMany', updatePassword);

UserSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  const { password } = this;

  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, password, (err, data) => {
      if (err) return reject(err);

      return resolve(data);
    });
  });
};

UserSchema.methods.createSession = async function createSession() {
  const refreshToken = await RefreshToken.create({ userId: this._id });
  const accessToken = await createAccessToken({
    user: {
      id: this._id
    }
  });

  return {
    refreshToken: refreshToken.token,
    accessToken
  };
};

UserSchema.plugin(softDeletePlugin, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true
});

module.exports = model('Users', UserSchema);
