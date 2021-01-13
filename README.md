# Encryption Tool using Node Crypto Module

---

**_Make sure to first install the required dependencies with_** `npm i`.

## Command Line Usage

Run the program with `node encryptiontoolcli.js`.

Generate a new KeyPair with `node encryptiontoolcli.js generate --passphrase="PASS_PHRASE"`.

Encrypt data with `node encryptiontoolcli.js encrypt --message="MESSAGE_TO_ENCRYPT"`.

Decrypt data with `node encryptiontoolcli.js decrypt --passphrase="PASS_PHRASE"`.

Files will be automatically generated to store the encrypted and decrypted information.

## Programmatic Usage

First require the module:

    const encryptionTool = require("utils/encryptiontool");

#### Generate Keys

    encryptionTool.generateKeyPair(passphrase);

The argument `passphrase` requires a plaintext string which is used to encrypt the private key. The private key can then be stored securely on the server's filesystem. If the server is compromised and the key is stolen, it cannot be used by an attacker without the passphrase.

**Do not lose this passphrase, all data stored in the database will be lost without it!**

Calling this function will generate a `publicKey.pem` and `privateKey.pem` in a `keys` directory, these files will be used to encrypt the data before it is stored in the database.

#### Encrypt Message

    const encryptedMessage = encryptionTool.encryptMessage(publicKeyPath, messageToEncrypt);

The argument `publicKeyPath` is the relative path to the generated public key: `keys/publicKey.pem`.

The argument `messageToEncrypt` is a plaintext string to be encrypted.

The function returns a base64 encoded encrypted string.

#### Decrypt Message

    const decryptedMessage = encryptionTool.decryptMessage(privateKeyPath, passphrase, encryptedMessage);

The argument `privateKeyPath` is the relative path to the generated private key: `keys/privateKey.pem`.

The argument `passphrase` is the passphrase supplied when generating the private key.

The argument `encryptedMessage` is the string to be encrypted. _Note: the string must be base64 encoded._

The function returns the original string.

### Usage:

1. The `generateKeys` function only needs to be called once, the keys will be saved in the filesystem and they can then be used to encrypt and decrypt data from then on.

2. When a user creates an account, use `encryptMessage` to encrypt all personally identifiable data and then store the encrypted data in the database.

3. When a request is made from the front-end, data should be retrieved from the database, decrypted with `decryptMessage` and then the decrypted information should be sent in the response.

4. To check that an account already exists with an email address when a user creates a new account, emails in the database should be decrypted before they are checked against the supplied email address. If this causes performance issues we can hash the email address instead and encrypt all other personally identifiable data in this way.
