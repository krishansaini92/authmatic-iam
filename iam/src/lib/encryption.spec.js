/* eslint-disable no-unused-expressions */
const { describe, it } = require('mocha');
const { expect } = require('chai');
const config = require('config');
const { encrypt, decrypt, pureEncrypt } = require('./encryption');

describe('Lib:encryption', () => {
  describe('encrypt', () => {
    it('should throw if required attribute secret is not provided', () => {
      const text = 'hello world';
      const secret = null;
      expect(() => encrypt(secret, text)).to.throw('InsufficientArguments: "secret" is required');
    });
    it('should throw if required attribute text is not provided', () => {
      const secret = 'secret';
      const text = null;
      expect(() => encrypt(secret, text)).to.throw('InsufficientArguments: "text" is required');
    });
    it('should return an encrypted string', () => {
      const secret = 'secret';
      const text = 'hello world';
      const encryptedData = encrypt(secret, text);

      // eslint-disable-next-line no-unused-expressions
      expect(encryptedData).to.not.be.equal(text);
      const decryptedData = decrypt(secret, encryptedData);
      expect(decryptedData).to.be.equal(text);
    });
    it('should return different encrypted string for same plain text', () => {
      const secret = 'secret';
      const text = 'hello world';
      const encryptedData = encrypt(secret, text);
      const encryptedData2 = encrypt(secret, text);

      expect(encryptedData).to.not.be.equals(encryptedData2);
    });
  });

  describe('decrypt', () => {
    it('should throw error if required attribute secret is not provided', () => {
      const encryptedText = 'hello world';
      const secret = null;
      expect(() => decrypt(secret, encryptedText)).to.throw('InsufficientArguments: "secret" is required');
    });
    it('should throw error if required attribute encryptedText is not provided', () => {
      const secret = 'secret';
      const encryptedText = null;
      expect(() => decrypt(secret, encryptedText)).to.throw('InsufficientArguments: "encryptedText" is required');
    });

    it('should return a decrypted string when aes encrypted text is passed', () => {
      const secret = 'secret';
      const text = 'hello world';
      const encryptedData = encrypt(secret, text);
      const decryptedData = decrypt(secret, encryptedData);
      expect(decryptedData).to.be.equals('hello world');
    });
    it('should return same plain text if different encrpyted texts generated from same input are passed', () => {
      const secret = 'secret';
      const text = 'hello world';
      const encryptedData = encrypt(secret, text);
      const encryptedData2 = encrypt(secret, text);
      const decryptedData = decrypt(secret, encryptedData);
      const decryptedData2 = decrypt(secret, encryptedData2);

      expect(decryptedData).to.be.equals(decryptedData2);
    });
  });

  describe('pureEncrypt', () => {
    it('should throw if required attribute ecbKey is not provided', () => {
      const text = 'hello world';
      const ecbKey = null;
      expect(() => pureEncrypt(ecbKey, text)).to.throw('InsufficientArguments: "ecbKey" is required');
    });
    it('should throw if required attribute text is not provided', () => {
      const ecbKey = 'secret';
      const text = null;
      expect(() => pureEncrypt(ecbKey, text)).to.throw('InsufficientArguments: "text" is required');
    });
    it('should return an encrypted string', () => {
      const { ecbKey } = config.get('encryption').userPrivacyData;
      const text = 'hello world';
      const encryptedData = pureEncrypt(ecbKey, text);

      // eslint-disable-next-line no-unused-expressions
      expect(encryptedData).to.not.be.equal(text);
    });
    it('should return same encrypted string for same text', () => {
      const { ecbKey } = config.get('encryption').userPrivacyData;
      const text = 'hello world';
      const encryptedData = pureEncrypt(ecbKey, text);
      const encryptedData2 = pureEncrypt(ecbKey, text);
      expect(encryptedData).to.be.equals(encryptedData2);
    });
  });
});
