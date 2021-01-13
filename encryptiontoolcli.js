/* 

------- CLI Tool Instructions -------

Use --help to list available commands.

1. Install Dependencies
Usage: npm i

2. Generate Keys
Usage: node encryption-tool.js generate --passphrase=""

3. Encrypt Message
Usage: node encryption-tool.js encrypt "message-to-encrypt"

4. Decrypt Message
Usage: node encryption-tool.js decrypt "relative-path-to-encrypted-message.txt".

*/

const fs = require("fs");
const chalk = require("chalk");
const path = require("path");
const yargs = require("yargs");
const encryptionTool = require("./utils/encryptiontool");

if (
  !(
    process.argv.includes("generate", 2) ||
    process.argv.includes("encrypt", 2) ||
    process.argv.includes("decrypt", 2)
  ) &&
  process.argv.length > 2
) {
  console.log(
    "Please use --help to see usage instructions and a list of available commands."
  );
}

yargs.command({
  command: "generate",
  desc:
    "Generates a pair of private and public keys and stores them in the filesystem.",
  builder: {
    passphrase: {
      desc:
        "A short string passphrase to encrypt the private key for secure storage.",
      demandOption: true,
      type: "string",
    },
  },
  handler(argv) {
    encryptionTool.generateKeyPair(argv.passphrase);
  },
});

yargs.command({
  command: "encrypt",
  desc:
    "Encrypts the provided plaintext message and outputs the result to encrypted-message.txt",
  builder: {
    message: {
      desc: "A plaintext message to encrypt.",
      demandOption: true,
      type: "string",
    },
  },
  handler(argv) {
    encryptionTool.encryptMessage("../keys/publickey.pem", argv.message);
  },
});

yargs.command({
  command: "decrypt",
  desc:
    "Decrypts the provided text file and outputs the result to decrypted-message.txt",
  builder: {
    passphrase: {
      desc: "The passphrase used when generating the private key.",
      demandOption: true,
      type: "string",
    },
  },
  handler(argv) {
    try {
      const encryptedMessageFromFile = fs.readFileSync(
        path.join(__dirname, "./encrypted-message.txt").toString("base64")
      );
      encryptionTool.decryptMessage(
        "../keys/privatekey.pem",
        argv.passphrase,
        encryptedMessageFromFile.toString()
      );
    } catch (error) {
      console.log(
        chalk.red.bold.inverse(
          "\n *** An error occurred and the string could not be decrypted *** \n\n".toUpperCase()
        ) + chalk.red.bold(error + "\n")
      );
      if (error.errno === -2) {
        console.log(
          chalk.red.bold(
            "Please use the encrypt command first to generate 'encrypted-message.txt'.\n"
          )
        );
      }
    }
  },
});

yargs.demandCommand(1, "Please provide one of the above commands.").parse();
