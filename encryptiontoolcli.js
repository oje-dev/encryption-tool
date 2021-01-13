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
    encryptionTool.generateKeyPair(
      argv.passphrase,
      (error, publicKey, privateKey) => {
        try {
          if (error) {
            throw error;
          }
          if (!fs.existsSync("keys")) {
            fs.mkdirSync("keys");
          }
          fs.writeFileSync(
            path.join(__dirname, "./keys/publickey.pem"),
            publicKey
          );
          fs.writeFileSync(
            path.join(__dirname, "./keys/privatekey.pem"),
            privateKey
          );
          console.log(
            chalk.greenBright.bold.inverse(
              "\n *** keypair generated successfully *** \n\n".toUpperCase()
            ) +
              chalk.greenBright.bold(
                "Output: " +
                  path.join(__dirname, "./keys/privatekey.pem") +
                  "\n" +
                  "Output: " +
                  path.join(__dirname, "./keys/publickey.pem") +
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
      }
    );
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
    try {
      encryptionTool.encryptMessage(
        path.join(__dirname, "./keys/publickey.pem"),
        argv.message,
        (error, encryptedString) => {
          if (error) {
            throw error;
          }
          fs.writeFileSync("encrypted-message.txt", encryptedString);
          console.log(
            chalk.greenBright.bold.inverse(
              "\n *** message encrypted successfully *** \n\n".toUpperCase()
            ) +
              chalk.greenBright.bold(
                "Output: " +
                  path.join(__dirname, "./encrypted-message.txt") +
                  "\n\n" +
                  encryptedString.toString("base64") +
                  "\n"
              )
          );
        }
      );
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
        path.join(__dirname, "./keys/privatekey.pem"),
        argv.passphrase,
        encryptedMessageFromFile.toString(),
        (error, decryptedMessage) => {
          if (error) {
            throw error;
          }
          fs.writeFileSync("decrypted-message.txt", decryptedMessage);
          console.log(
            chalk.greenBright.bold.inverse(
              "\n *** message decrypted successfully *** \n\n".toUpperCase()
            ) +
              chalk.greenBright.bold(
                "Output to: " +
                  path.join(__dirname, "./decrypted-message.txt") +
                  "\n\n" +
                  "Output: " +
                  decryptedMessage +
                  "\n"
              )
          );
        }
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
