const fs = require("fs");

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config({ path: "../.env" });
const adminListJSON = require("../data/admin_list.json");

let chargerQueueJSON = require("../data/charger_queue.json");
let chargersJSON = require("../data/ev_chargers.json");

process.env.SILENCE_EMPTY_LAMBDA_WARNING = "true";

const app = express();
const router = express.Router();

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
  try {
    const id = JSON.parse(req.body.toString()).id; // Get id from frontend
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
    res.status(200).json(chargersJSON); // Ensure you return a success status
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message }); // Return an error response
  }
});

router.post("/add-ev-charger", async (req, res) => {
  try {
    const dataIntroLayer = JSON.parse(req.body.toString());
    const data = JSON.parse(dataIntroLayer.body);

    const name = data.name;
    const latitude = data.coordinates.latitude;
    const longitude = data.coordinates.longitude;

    chargersJSON.fuel_stations.push({
      station_name: name,
      latitude,
      longitude,
    });

    const jsonData = JSON.stringify(chargersJSON);
    fs.writeFileSync("./data/ev_chargers.json", jsonData);

    res.status(200).json("Charger queue updated successfully!");
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message }); // Return an error response
  }
});

// Add to the charger queue for admin inspection.
router.post("/add-to-charger-queue", async (req, res) => {
  try {
    const data = JSON.parse(req.body.toString());
    chargerQueueJSON = require("../data/charger_queue.json");

    // Add new data to the charger queue
    chargerQueueJSON.push(data);

    const jsonData = JSON.stringify(chargerQueueJSON);
    fs.writeFileSync("./data/charger_queue.json", jsonData);

    res.status(200).json("Charger queue updated successfully!");
  } catch (err) {
    console.error("Error saving JSON file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Remove from the charger queue for admin inspection.
router.post("/remove-from-charger-queue", async (req, res) => {
  try {
    const dataIntroLayer = JSON.parse(req.body.toString());
    const data = JSON.parse(dataIntroLayer.body);

    chargerQueueJSON = require("../data/charger_queue.json");

    // Remove data to the charger queue
    chargerQueueJSON = chargerQueueJSON.filter(
      (item) => !(item.name === data.name && item.address === data.address)
    );

    console.log("Updated JSON:", chargerQueueJSON);

    const jsonData = JSON.stringify(chargerQueueJSON);
    fs.writeFileSync("./data/charger_queue.json", jsonData);

    res.status(200).json("Charger queue updated successfully!");
  } catch (err) {
    console.error("Error saving JSON file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

// Requested chargers for input
router.get("/get-charger-queue", (req, res) => {
  try {
    res.status(200).json(chargerQueueJSON);
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message }); // Return an error response
  }
});

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
