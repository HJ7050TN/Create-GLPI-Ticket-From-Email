const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const logFile = fs.createWriteStream("log.txt", { flags: "a" });
console.log = (message) => {
  logFile.write(`${new Date().toISOString()} - ${message}\n`);
};

const apiUrl = "http://172.20.93.1/apirest.php";
const appToken = "PHiPwxf9uWpjJIzMQr6GCVkZ6q5oeEU163TVZScs";
const auth = {
  username: "glpi",
  password: "Elfo#3109",
};
let sessionToken;
let LinkedDoc = [];

async function uploadDocumentToGLPI(ticketId, documentFilePath) {
  try {
    // Resolve document name from the file path
    const documentName = path.basename(documentFilePath);

    // Construct the JSON payload for parameters
    const payload = {
      input: {
        name: documentName,
        tickets_id: ticketId,
      },
    };

    // Convert payload to JSON string
    const payloadString = JSON.stringify(payload);

    // Step 1: Create FormData object and append file and payload
    const formData = new FormData();
    formData.append("uploadManifest", payloadString);
    formData.append("uploadManifest[0]", fs.createReadStream(documentFilePath));

    // Step 2: Upload document using FormData
    const uploadResponse = await axios.post(`${apiUrl}/Document`, formData, {
      headers: {
        ...formData.getHeaders(),
        "App-Token": appToken,
        "Session-Token": sessionToken,
      },
    });

    // Extract the ID of the uploaded document
    const documentId = uploadResponse.data.id;

    // Step 3: Link document to ticket
    const docLink = await axios.post(
      `${apiUrl}/Document_Item/`,
      {
        input: {
          items_id: ticketId,
          itemtype: "Ticket",
          documents_id: documentId,
          add: "Add",
        },
      },
      {
        headers: {
          "App-Token": appToken,
          "Session-Token": sessionToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(" id: ",docLink.data.id,"\n","File Name: ", documentName );
  } catch (error) {
    console.error(
      "Error uploading document to GLPI:",
      error.response ? error.response.data : error.message
    );
  }
}

async function createGlpiTicket(title, description, paths) {
  try {
    // Make a request to initiate session with GLPI API
    const sessionResponse = await axios.get(`${apiUrl}/initSession`, {
      headers: {
        "App-Token": appToken,
        "Content-Type": "application/json",
      },
      auth,
    });

    // Extract session token from the response
    sessionToken = sessionResponse.data.session_token;

    // Log the obtained session token
    //console.log("Session token:", sessionToken);

    // Create ticket with title and description
    const ticketResponse = await axios.post(
      `${apiUrl}/Ticket`,
      {
        input: {
          name: title,
          content: description,
        },
      },
      {
        headers: {
          "Session-Token": sessionToken,
          "App-Token": appToken,
        },
      }
    );

    // Log the response of ticket creation
    console.log("Ticket created:", ticketResponse.data);

    if (paths.length > 0) {
      console.log("Attachments: ")
      for (const path of paths) {
        await uploadDocumentToGLPI(ticketResponse.data.id, path);
      }
    }
  } catch (error) {
    // Handle any errors that occur during the request
    console.error("Error occurred:", error.message);
  }
}

module.exports = createGlpiTicket;
