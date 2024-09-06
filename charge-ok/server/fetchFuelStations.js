require("dotenv").config();
const axios = require("axios");
const charger_api_key = process.env.CHARGER_API_KEY;

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

// Make the API request
axios
  .get(baseURL, { params })
  .then((response) => {
    // Handle the response data
    const ev_data = response.data;
    console.log("Data:", ev_data);
    console.log(Object.keys(ev_data.fuel_stations).length);
    //TODO now we have fuel stations, now get map
  })
  .catch((error) => {
    // Handle any errors
    console.error("Error:", error);
  });
