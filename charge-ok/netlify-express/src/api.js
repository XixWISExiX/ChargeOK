const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config({ path: "../.env" });

const app = express();
const router = express.Router();

app.use(cors());

router.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];
  res.json(users);
});

router.get("/generate-iframe-url", (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  // const mapType = "directions";
  // const mapParameters = "&origin=Oslo+Norway&destination=Telemark+Norway";

  const mapType = "place";
  // const mapParameters = "q=660 Parrington Oval, Norman, OK 73019";
  const mapParameters = "q=35.493411,-97.548452"; // A charging location based on Latitude and Longitude

  const searchLink = `https://www.google.com/maps/embed/v1/${mapType}?key=${apiKey}&${mapParameters}`;

  // Ensure the content type is JSON
  res.setHeader("Content-Type", "application/json");

  res.json({ url: searchLink });
});

app.use("/.netlify/functions/api", router);

module.exports.handler = serverless(app);
