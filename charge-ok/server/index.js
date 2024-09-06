const express = require("express");
const app = express();

require("dotenv").config({ path: "../.env" });

const cors = require("cors");
app.use(cors());

app.use(express.json());

app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
  ];
  res.json(users);
});

app.get("/generate-iframe-url", (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
