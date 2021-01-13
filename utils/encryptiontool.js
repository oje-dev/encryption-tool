const crypto = require("crypto");
const fs = require("fs");

/**
 * Generates a 'privatekey.pem' file containing an encrypted private key.
 * Generates a 'publickey.pem' file containing a corresponding public key.
 * Files are stored in a 'keys' directory.
 * @param {string} passphrase - A short passphrase string to encrypt the private key for secure storage. DO NOT LOSE!
 * @param {function} callback - Takes three parameters, error, publicKey and privateKey.
 */
const generateKeyPair = (passphrase, callback) => {
  try {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
          cipher: "aes-256-cbc",
          passphrase,
        },
      },
      (error, publicKey, privateKey) => {
        if (error) {
          return callback(error, undefined, undefined);
        }
        callback(undefined, publicKey, privateKey);
      }
    );
  } catch (error) {
    callback(error, undefined, undefined);
  }
};

/**
 * Encrypts a plaintext message using the generated public key.
 * @param {string} publicKeyPath - The relative path to the stored public key.
 * @param {string} messageToEncrypt - A plaintext message to encrypt.
 * @param {function} callback - Takes parameters error, encryptedString.
 */
const encryptMessage = (publicKeyPath, messageToEncrypt, callback) => {
  try {
    const publicKey = fs.readFileSync(publicKeyPath);
    const encryptedBuffer = crypto.publicEncrypt(
      publicKey,
      Buffer.from(messageToEncrypt)
    );
    callback(undefined, encryptedBuffer.toString("base64"));
  } catch (error) {
    callback(error, undefined);
  }
};

/**
 * Decrypts an encrypted string using the generated private key.
 * @param {string} privateKeyPath - The relative path to the stored private key.
 * @param {string} passphrase - The passphrase to decrypt the private key.
 * @param {string} encryptedMessage - A base64 encoded string to decrypt.
 * @param {function} callback - Takes parameters error, decryptedString.
 */
const decryptMessage = (
  privateKeyPath,
  passphrase,
  encryptedMessage,
  callback
) => {
  try {
    const privateKey = fs.readFileSync(privateKeyPath);
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase,
      },
      Buffer.from(encryptedMessage, "base64")
    );

    callback(undefined, decryptedBuffer.toString("utf-8"));
  } catch (error) {
    callback(error, undefined);
  }
};

module.exports = { generateKeyPair, encryptMessage, decryptMessage };
