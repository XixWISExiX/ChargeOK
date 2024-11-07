// const { getAllDocuments } = require("./fetchFuelStations.js");
const fs = require("fs");

const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config({ path: "../.env" });
const chargersJSON = require("../data/ev_chargers.json");
const adminListJSON = require("../data/admin_list.json");
let chargerQueueJSON = require("../data/charger_queue.json");

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
app.use(express.json());


// This is mainly a test function
router.get("/get-point", (req, res) => {
  const Latitude = 35.493411;
  const Longitude = -97.548452;
  const Name = "Rizz Station";
  const point = { lat: Latitude, lng: Longitude, name: Name };

  console.log("Returning point:", point);

  res.json(point); // Return point directly
});

router.post("/is-admin", (req, res) => {
  try {
    const id = req.body.id;
    console.log("Received ID in API:", id);  // Log the received UID from the request
    console.log("Admin List in API:", adminListJSON);  // Log the admin list as it appears in the route

    // Testing comparison
    const isAdmin = adminListJSON.admins.some((admin) => {
      console.log(`Comparing admin ID ${admin.id} with received ID ${id}`);
      return String(admin.id) === String(id);
    });

    console.log("Is Admin Result in API:", isAdmin);
    res.status(200).json({ isAdmin });
  } catch (err) {
    console.error("Error in /is-admin route:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
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

router.post("/update-charger-queue", (req, res) => {
  try {
    const data = JSON.parse(req.body.toString());
    chargerQueueJSON.push(data);
    console.log("New Json", chargerQueueJSON);
    // NOTE: Needs to be manually saved before backend is shut down

    res.status(200).json("Charger queue updated successfully!");
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message }); // Return an error response
  }
});

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
