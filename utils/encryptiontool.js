const chalk = require("chalk");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/**
 * Generates a 'privatekey.txt' file containing an encrypted private key.
 * Generates a 'publickey.txt' file containing a corresponding public key.
 * Files are stored in a 'keys' directory.
 * @param {string} passphrase - A short passphrase string to encrypt the private key for secure storage. DO NOT LOSE!
 */
const generateKeyPair = (passphrase) => {
  try {
    const keyPair = crypto.generateKeyPairSync("rsa", {
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
    });
    if (!fs.existsSync("../keys")) {
      fs.mkdirSync("../keys");
    }
    fs.writeFileSync(
      path.join(__dirname, "../keys/publickey.pem"),
      keyPair.publicKey
    );
    fs.writeFileSync(
      path.join(__dirname, "../keys/privatekey.pem"),
      keyPair.privateKey
    );
    console.log(
      chalk.greenBright.bold.inverse(
        "\n *** keypair generated successfully *** \n\n".toUpperCase()
      ) +
        chalk.greenBright.bold(
          "Output: " +
            path.join(__dirname, "../keys/privatekey.pem") +
            "\n" +
            "Output: " +
            path.join(__dirname, "../keys/publickey.pem") +
            "\n"
        )
    );
  } catch (error) {
    console.log(
      chalk.red.bold.inverse(
        "\n *** An error occurred and the keypair could not be generated *** \n\n".toUpperCase()
      ) +
        chalk.red.bold(error) +
        "\n"
    );
  }
};

/**
 * Encrypts a plaintext message using the generated public key.
 * @param {string} publicKeyPath - The relative path to the stored public key.
 * @param {string} messageToEncrypt - A plaintext message to encrypt.
 * @returns {string} - An encrypted base64 encoded string.
 */
const encryptMessage = (publicKeyPath, messageToEncrypt) => {
  try {
    const publicKey = fs.readFileSync(path.join(__dirname, publicKeyPath));
    const encryptedBuffer = crypto.publicEncrypt(
      publicKey,
      Buffer.from(messageToEncrypt)
    );

    fs.writeFileSync(
      "encrypted-message.txt",
      encryptedBuffer.toString("base64")
    );

    console.log(
      chalk.greenBright.bold.inverse(
        "\n *** message encrypted successfully *** \n\n".toUpperCase()
      ) +
        chalk.greenBright.bold(
          "Output: " +
            path.join(__dirname, "../encrypted-message.txt") +
            "\n\n" +
            encryptedBuffer.toString("base64") +
            "\n"
        )
    );

    return encryptedBuffer.toString("base64");
  } catch (error) {
    console.log(
      chalk.red.bold.inverse(
        "\n *** An error occurred and the string could not be encrypted *** \n\n".toUpperCase()
      ) + chalk.red.bold(error + "\n")
    );
    if (error.errno === -2) {
      console.log(
        chalk.red.bold(
          "Please run the generate command to generate encryption keys.\n"
        )
      );
    }
  }
};

/**
 * Decrypts an encrypted string using the generated private key.
 * @param {string} privateKeyPath - The relative path to the stored private key.
 * @param {string} encryptedMessage - A plaintext base64 encoded string to decrypt.
 * @returns {string} - A utf-8 encoded plaintext decrypted string.
 */
const decryptMessage = (privateKeyPath, passphrase, encryptedMessage) => {
  try {
    const privateKey = fs.readFileSync(path.join(__dirname, privateKeyPath));
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase,
      },
      Buffer.from(encryptedMessage, "base64")
    );

    fs.writeFileSync(
      "decrypted-message.txt",
      decryptedBuffer.toString("utf-8")
    );

    console.log(
      chalk.greenBright.bold.inverse(
        "\n *** message decrypted successfully *** \n\n".toUpperCase()
      ) +
        chalk.greenBright.bold(
          "Input from: " +
            path.join(__dirname, "../encrypted-message.txt") +
            "\n\n" +
            "Input: " +
            encryptedMessage +
            "\n\n" +
            "Output to: " +
            path.join(__dirname, "../decrypted-message.txt") +
            "\n\n" +
            "Output: " +
            decryptedBuffer.toString("utf-8") +
            "\n"
        )
    );

    return decryptedBuffer.toString("utf-8");
  } catch (error) {
    console.log(
      chalk.red.bold.inverse(
        "\n *** An error occurred and the string could not be encrypted *** \n\n".toUpperCase()
      ) + chalk.red.bold(error + "\n")
    );
  }
};

module.exports = { generateKeyPair, encryptMessage, decryptMessage };
