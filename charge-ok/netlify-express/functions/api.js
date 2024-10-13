const { getAllDocuments } = require("./fetchFuelStations.js");

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config({ path: "../.env" });

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

router.get("/get-ev-chargers", (req, res) => {
  console.log("backend activated");

  getAllDocuments("ev_chargers")
    .then((result) => {
      // console.log(result);
      console.log(result.length);
      res.json(result);
    })
    .catch((error) => {
      console.log("Database Connection Failed");
      console.error("Error fetching EV chargers:", error);
      res.status(500).json({ error: "Failed to fetch EV chargers" });
    });
});

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
