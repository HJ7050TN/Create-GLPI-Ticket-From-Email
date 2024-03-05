require("dotenv").config();
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const fs = require("fs");

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

const myPromise = () =>
  new Promise((resolve, reject) => {
    // IMAP configuration
    const imapConfig = {
      user: process.env.MAIL,
      password: process.env.MAIL_PASSWORD,
      host: process.env.HOST,
      port: process.env.PORT,
      tls: process.env.TLS == "ON",
    };

    // Connect to the IMAP server
    const imap = new Imap(imapConfig);

    function onBody(stream, info) {
      console.log("Body stream received");
      simpleParser(stream)
        .then((parsed) => {
          let emailData = {
            from: parsed.from.text,
            to: parsed.to.text,
            subject: parsed.subject,
            content: parsed.text,
            attachments: [],
          };

          // Check if attachments exist
          if (parsed.attachments && parsed.attachments.length > 0) {
            // Process attachments
            for (const attachment of parsed.attachments) {
              try {
                const attachmentPath = `./attachments/${attachment.filename}`;
                fs.promises.writeFile(attachmentPath, attachment.content);
                emailData.attachments.push(attachmentPath);
              } catch (err) {
                console.error("Error saving attachment:", err);
              }
            }
          } else {
            console.log("No attachments found in the email.");
          }

          resolve(emailData);
        })
        .catch((error) => {
          console.error("Error parsing email:", error);
        });
    }

    imap.once("ready", () => {
      //console.log("IMAP connection ready");
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          console.error("Error opening INBOX:", err);
          return;
        }
        //console.log("INBOX opened");

        // Search for unseen emails
        imap.search(["UNSEEN"], (searchErr, searchResults) => {
          if (searchErr) {
            console.error("Error searching for unseen emails:", searchErr);
            return;
          }

          //console.log("Unseen email search results:", searchResults);

          // Get the last unseen email
          const lastEmailUid = searchResults.pop();
          if (!lastEmailUid) {
            console.log("No unseen emails found");
            imap.end(); // End the IMAP connection if no unseen emails found
            return;
          }

          //console.log("Last unseen email UID:", lastEmailUid);

          const emailFetch = imap.fetch(lastEmailUid, { bodies: "" });

          emailFetch.on("message", async (msg, seqno) => {
            //console.log("Processing message:", seqno);

            msg.on("body", onBody);

            msg.once("attributes", (attrs) => {
              //console.log("Message attributes:", attrs);

              // Mark the email as seen
              imap.setFlags([attrs.uid], ["\\Seen"], (err) => {
                if (err) {
                  console.error("Error marking email as seen:", err);
                } else {
                  //console.log("Email marked as seen");
                }
              });
            });

            msg.once("end", function () {
              //console.log("Message end event received");

              //console.log("Email processing complete");
              msg.removeListener("body", onBody);

              // Check if this is the last message to process
              if (seqno === searchResults.length) {
                //console.log("Last message processed, ending IMAP connection");
                imap.end(); // End the IMAP connection after processing all messages
              }
            });
          });

          emailFetch.once("error", (err) => {
            console.error("Fetch error:", err);
          });

          emailFetch.once("end", function () {
            //console.log("Done fetching all messages!");
            imap.end(); // End the IMAP connection if there's an error
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP connection error:", err);
    });

    imap.once("end", () => {
      console.log("IMAP connection ended");
    });

    console.log("Connecting to IMAP server");
    imap.connect();
  });

module.exports = myPromise;
