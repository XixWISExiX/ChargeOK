require("dotenv").config({ path: "../.env" });
const axios = require("axios");
const charger_api_key = process.env.CHARGER_API_KEY;
const charger_doc_id = process.env.FIREBASE_EV_CHARGER_COLLECTION_DOCUMENT_ID;
const path = require("path");

//---------------------------------------------------------------------------------
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseServiceAccountKey.json"); // Replace with your service account key path
const firebase_project_id = process.env.REACT_APP_FIREBASE_PROJECT_ID;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${firebase_project_id}.firebaseio.com`, // Replace with your database URL
});

const db = admin.firestore(); // Use Firestore; for Realtime Database, use admin.database()
//---------------------------------------------------------------------------------

// Define the base URL for the API
const baseURL = "https://developer.nrel.gov/api/alt-fuel-stations/v1"; // Replace with the actual base URL

// Define the parameters
const params = {
  format: "json", // Response format
  api_key: charger_api_key, // Replace with your actual API key
  fuel_type: "ELEC", // Electric
  access: "public", // Public access
  state: "OK",
};

const fs = require("fs");

// Function to generate a JSON file and save it to the filesystem
const downloadJSONFile = (data, filename) => {
  const jsonContent = JSON.stringify(data, null, 2); // Convert data to JSON string
  const filePath = path.join(__dirname, filename); // Define file path

  // Write the JSON content to a file
  fs.writeFile(filePath, jsonContent, "utf8", (err) => {
    if (err) {
      console.error("Error writing JSON to file:", err);
      return;
    }

    console.log(`File has been saved as ${filename}`);
  });
};

const uploadJsonToFirebase = async (filePath) => {
  try {
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const evFuelStations = jsonData.fuel_stations;

    // Upload JSON data to Firestore
    // Loop through each station and upload as a separate document
    evFuelStations.forEach(async (station) => {
      const docRef = db.collection("ev_chargers").doc(`${station.id}`); // Use station ID or any unique identifier
      await docRef.set(station); // Set the document with the station data
      console.log(`Uploaded station: ${station.station_name}`);
    });

    console.log("JSON data uploaded successfully");
  } catch (error) {
    console.error("Error uploading JSON data:", error);
  }
};

const deleteAllDocuments = async (collectionName) => {
  try {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log("No documents found in the collection.");
      return;
    }

    // Loop through each document and delete it
    snapshot.forEach(async (doc) => {
      await doc.ref.delete();
      console.log(`Deleted document with ID: ${doc.id}`);
    });

    console.log(`All documents in ${collectionName} collection deleted.`);
  } catch (error) {
    console.error("Error deleting documents:", error);
  }
};

const getAllDocuments = async (collectionName) => {
  try {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log("No documents found in the collection.");
      return [];
    }

    const documents = [];
    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    console.log("Documents retrieved:", documents);
    return documents;
  } catch (error) {
    console.error("Error retrieving documents:", error);
  }
};

// NOTE comment and uncomment out the code for the following
// DOWNLOAD json to local, UPLOAD json into db, DELETE json from db, GET json from db

// // Make the API request and store api in local json file
// // ------------------------------------------
// axios
//   .get(baseURL, { params })
//   .then((response) => {
//     // Handle the response data
//     const ev_data = response.data;
//     console.log("Data:", ev_data);
//     console.log(Object.keys(ev_data.fuel_stations).length);
//     // downloadJSONFile(ev_data, "data/ev_chargers.json");
//   })
//   .catch((error) => {
//     // Handle any errors
//     console.error("Error:", error);
//   });
// // ------------------------------------------

// uploadJsonToFirebase("data/ev_chargers.json");
// deleteAllDocuments("ev_chargers");
console.log(getAllDocuments("ev_chargers"));
