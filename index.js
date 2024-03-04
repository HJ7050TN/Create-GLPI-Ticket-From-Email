const moment = require("moment");
const gum = require("./getUnseenMail");
const cgt = require("./createGlpiTicket");

const run = async () => {
  try {
    console.log(moment().format("MMMM Do YYYY, h:mm:ss a"));
    const { from, subject, content, attachments } = await gum();
    await cgt(`${subject} ( ${from} )`, content, attachments);
  } catch (error) {
    console.error("Error in run function:", error);
  }
};

run();
