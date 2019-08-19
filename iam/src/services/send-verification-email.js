const {
  encryption,
  templates: {
    emails: { verifyEmail: emailVerificationTemplate }
  }
} = require('config');
const { encrypt } = require('../lib/encryption');
const { sendEmail } = require('./send-email');

const sendVerificationEmail = async ({ user, logger }) => {
  try {
    const emailVerifyCode = (Math.floor(Math.random() * 9999) + 1111).toString().substr(0, 4);
    await sendEmail(emailVerificationTemplate, user.email, {
      id: encrypt(encryption.get('userPrivacyData.secret'), user._id.toString()),
      emailVerifyCode: encrypt(encryption.get('userPrivacyData.secret'), emailVerifyCode)
    });

    logger.debug('Sent verification email');
  } catch (error) {
    logger.error('Error while sending verification email: ', error);
  }
};

module.exports = sendVerificationEmail;
