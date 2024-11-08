import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const mapbox_api_key = process.env.MAPBOX_API_KEY;
const geocode_baseurl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

if (!mapbox_api_key) {
  throw new Error('MAPBOX_API_KEY is not set in environment variables');
}

async function getCoord(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${geocode_baseurl}${encodedAddress}.json`;

    const params = {
      access_token: mapbox_api_key,
      limit: 1
    };

    console.log('Making request to:', url); // Debug log
    const response = await axios.get(url, { params });

    if (response.data?.features?.length > 0) {
      const [longitude, latitude] = response.data.features[0].center;
      return { latitude, longitude };
    } else {
      throw new Error('No coordinates found for the provided address.');
    }
  } catch (error) {
    console.error('Error getting address:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

export default getCoord;