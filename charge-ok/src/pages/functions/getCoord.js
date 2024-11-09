import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to look for .env file in project root
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Debug logs
console.log("Current directory:", __dirname);
console.log(
  "Environment variables loaded:",
  process.env.MAPBOX_API_KEY ? "Yes" : "No"
);

const mapbox_api_key = process.env.MAPBOX_API_KEY;
const geocode_baseurl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

if (!mapbox_api_key) {
  console.error("Available environment variables:", Object.keys(process.env));
  throw new Error("MAPBOX_API_KEY is not set in environment variables");
}

async function getCoord(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${geocode_baseurl}${encodedAddress}.json`;

    const params = {
      access_token: mapbox_api_key,
      limit: 1,
    };

    console.log("Making request to:", url);
    console.log("Using API key:", mapbox_api_key.substring(0, 4) + "...");

    const response = await axios.get(url, { params });

    if (response.data?.features?.length > 0) {
      const [longitude, latitude] = response.data.features[0].center;
      return { latitude, longitude };
    } else {
      throw new Error("No coordinates found for the provided address.");
    }
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export default getCoord;
