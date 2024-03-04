const fs = require("fs");

const logFile = fs.createWriteStream("log.txt", { flags: "a" });
console.log = (message) => {
  logFile.write(`${new Date().toISOString()} - ${message}\n`);
};

const gum = require("./getUnseenMail");
const cgt = require("./createGlpiTicket");

const run = async () => {
  try {
    const { from, subject, content, attachments } = await gum();
    await cgt(`${subject} ( ${from} )`, content, attachments);
  } catch (error) {
    console.error("Error in run function:", error);
  }
};

run();
