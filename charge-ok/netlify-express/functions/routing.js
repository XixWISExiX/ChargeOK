const axios = require("axios");

const mapbox_api_key = process.env.MAPBOX_API_KEY;
const baseurl = "https://api.mapbox.com/directions/v5/mapbox/driving/";
const mapping_params = {
  alternatives: "false",
  geometries: "geojson",
  overview: "simplified",
  steps: "false",
  access_token: mapbox_api_key,
};

const route = async function (start, dest) {
  try {
    let url =
      baseurl + start[0] + "%2C" + start[1] + "%3B" + dest[0] + "%2C" + dest[1];
    return await axios.get(url, { mapping_params });
  } catch (error) {
    console.log("Error occcured getting route:", error);
  }
};

// taken from https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function getDistanceFromLatLonInKm(start, dest) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(dest[0] - start[0]); // deg2rad below
  var dLon = deg2rad(dest[1] - start[1]);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function point_along_route_sums_distance(line, cutoff) {
  sum = 0;
  idx = 1;
  while (sum < cutoff && idx < a.length) {
    (sum += line[i - 1]), line[i];
  }

  return idx;
}

function get_closest_station(point) {
  // development only
  const stations = axios.get('http://localhost:9000/.netlify/functions/api/get-ev-chargers');
  let closest = stations[0];
  let closestPoint = [closest['latitude'], closest['longitude']];
  let closestDist = getDistanceFromLatLonInKm(point, closestPoint);
  for(let i = 1; i < stations.length; ++i) {
    let testStation = stations[i];
    let testPoint = [testStation['latitude'], testStation['longitude']];
    let testDist = getDistanceFromLatLonInKm(point, testPoint);
    if(testDist < closestDist) {
      closest = testStation;
      closestPoint = testPoint;
      closestDist = testDist;
    }
  }

  return closest;
}
