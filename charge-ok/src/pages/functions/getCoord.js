import axios from "axios";

const mapbox_api_key = process.env.REACT_APP_MAPBOX_API_KEY;
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

async function getCoord(address) {
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

async function getBestCoord(address, startPoint) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${geocode_baseurl}${encodedAddress}.json`;

    const params = {
      access_token: mapbox_api_key,
      limit: 10,
    };

    // console.log("Making request to:", url);
    // console.log("Using API key:", mapbox_api_key.substring(0, 4) + "...");

    const response = await axios.get(url, { params });

    if (response.data?.features?.length > 0) {
      const results = response.data.features;
      let closestDistance = Infinity;
      let closestLocation = null;

      // Loop through the results and find the closest one
      results.forEach((result) => {
        const lat = result.center[1]; // latitude
        const lon = result.center[0]; // longitude

        const distance = getDistance(startPoint[0], startPoint[1], lat, lon);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestLocation = result;
        }
      });

      if (closestLocation) {
        const { latitude, longitude } = {
          latitude: closestLocation.center[1],
          longitude: closestLocation.center[0],
        };
        console.log(
          `Closest Whataburger: Latitude: ${latitude}, Longitude: ${longitude}`
        );
        return { latitude, longitude };
      } else {
        throw new Error("No coordinates found for the provided address.");
      }
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

export default { getCoord, getBestCoord };
