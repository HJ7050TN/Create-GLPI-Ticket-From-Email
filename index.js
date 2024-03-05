require("dotenv").config();
const fs = require("fs");
const findRemoveSync = require("find-remove");

if (process.env.SAVE_LOG == "ON") {
  const logFile = fs.createWriteStream("log.txt", { flags: "a" });
  console.log = (message, ...variables) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message} ${variables
      .map((v) => JSON.stringify(v))
      .join(", ")}`;
    logFile.write(`${logMessage}\n`);
  };
}

const gum = require("./getUnseenMail");
const cgt = require("./createGlpiTicket");

const run = async () => {
  try {
    const { from, subject, content, attachments } = await gum();
    await cgt(`${subject} ( ${from} )`, content, attachments);
    if (process.env.ATTACHEMNTS_DELETE_AFTER !== "0") {
      findRemoveSync(__dirname + "/attachments", {
        age: {
          seconds: 60 * 60 * 24 * Number(process.env.ATTACHEMNTS_DELETE_AFTER),
        },
      });
    }
  } catch (error) {
    console.error("Error in run function:", error);
  }
};

run();
