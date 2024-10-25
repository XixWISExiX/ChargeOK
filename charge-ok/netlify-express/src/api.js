// const { getAllDocuments } = require("./fetchFuelStations.js");
const fs = require("fs");

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config({ path: "../.env" });
const chargersJSON = require("../data/ev_chargers.json");
const adminListJSON = require("../data/admin_list.json");

const app = express();
const router = express.Router();

// // Inside your existing function, before your main logic
// const dataDir = path.join(__dirname, "./data"); // Adjust this path if needed

// app.use(
//   cors({
//     origin: "*", // Allow all origins
//     methods: "GET,POST", // Allow specific HTTP methods
//     allowedHeaders: "Content-Type,Authorization", // Allow specific headers
//   })
// );

app.use(cors());

// This is mainly a test function
router.get("/get-point", (req, res) => {
  const Latitude = 35.493411;
  const Longitude = -97.548452;
  const Name = "Rizz Station";
  const point = { lat: Latitude, lng: Longitude, name: Name };

  console.log("Returning point:", point);

  res.json(point); // Return point directly
});

// Returns if the id is an admin or not
router.post("/is-admin", (req, res) => {
  const id = JSON.parse(req.body.toString()).id; // Get id from frontend
  try {
    const checkIdInJson = (id) => {
      return adminListJSON.includes(id);
    };
    if (checkIdInJson(id)) res.status(200).json(true); // user is admin
    else res.status(200).json(false); // user isn't admin
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message }); // Return an error response
  }
});

router.get("/get-ev-chargers", (req, res) => {
  console.log("backend activated");
  try {
    const jsonData = JSON.parse(
      fs.readFileSync("./data/ev_chargers.json", "utf-8")
    );
    const evFuelStations = jsonData.fuel_stations;
    res.status(200).json(evFuelStations); // Ensure you return a success status
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message }); // Return an error response
  }

  // getAllDocuments("ev_chargers")
  //   .then((result) => {
  //     // console.log(result);
  //     console.log(result.length);
  //     res.json(result);
  //   })
  //   .catch((error) => {
  //     console.log("Database Connection Failed");
  //     console.error("Error fetching EV chargers:", error);
  //     res.status(500).json({ error: "Failed to fetch EV chargers" });
  //   });
});

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
