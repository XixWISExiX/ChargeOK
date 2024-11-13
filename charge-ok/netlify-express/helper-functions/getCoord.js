import axios from "axios";

const mapbox_api_key = process.env.MAPBOX_API_KEY;
const geocode_baseurl = "https://api.mapbox.com/geocoding/v5/mapbox.places/";

if (!mapbox_api_key) {
  console.error("Available environment variables:", Object.keys(process.env));
  throw new Error("MAPBOX_API_KEY is not set in environment variables");
}

function getDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula to calculate the distance between two lat/long points
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export async function getCoord(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${geocode_baseurl}${encodedAddress}.json`;

    const params = {
      access_token: mapbox_api_key,
      limit: 1,
    };

    // console.log("Making request to:", url);
    // console.log("Using API key:", mapbox_api_key.substring(0, 4) + "...");

    const response = await axios.get(url, { params });

    if (response.data?.features?.length > 0) {
      const [longitude, latitude] = response.data.features[0].center;
      return { latitude, longitude };
    }

    return null;
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
}
