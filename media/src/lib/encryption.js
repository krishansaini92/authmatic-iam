const crypto = require('crypto');
const CryptoJS = require('crypto-js');

// using crypto-js aes algo, we are getting different encrypted text every time
// even for same input

// secret is made here a parameter because in future if we need to implement
// a strategy of variable secret key
const encrypt = (secret, text) => {
  if (!secret) {
    throw new Error('InsufficientArguments: "secret" is required');
  }
  if (!text) {
    throw new Error('InsufficientArguments: "text" is required');
  }

  return CryptoJS.AES.encrypt(text, secret).toString();
};

const decrypt = (secret, encryptedText) => {
  if (!secret) {
    throw new Error('InsufficientArguments: "secret" is required');
  }
  if (!encryptedText) {
    throw new Error('InsufficientArguments: "encryptedText" is required');
  }

  const decryptedText = CryptoJS.AES.decrypt(encryptedText, secret).toString(CryptoJS.enc.Utf8);
  if (decryptedText && decryptedText.length) {
    return decryptedText;
  }
  throw new Error('Invalid encrypted text');
};

// Ecb mode of encryption provides the same encrypted text everytime
// for same input
const pureEncrypt = (ecbKey, text) => {
  if (!ecbKey) {
    throw new Error('InsufficientArguments: "ecbKey" is required');
  }
  if (!text) {
    throw new Error('InsufficientArguments: "text" is required');
  }

  const key = Buffer.from(ecbKey, 'hex');
  const src = Buffer.from(text, 'hex');

  const cipher = crypto.createCipheriv('aes-128-ecb', key, '');

  let result = cipher.update(src).toString('hex');
  result += cipher.final().toString('hex');

  return result;
};

module.exports = {
  encrypt,
  decrypt,
  pureEncrypt
};
