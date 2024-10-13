const axios = require("axios");
const { getAllDocuments } = require("./fetchFuelStations.js");
const s = require('../data/ev_chargers.json');
require("dotenv").config({ path: "../.env" });

const mapbox_api_key = process.env.MAPBOX_API_KEY;
const baseurl = "https://api.mapbox.com/directions/v5/mapbox/driving/";
const params = {
  alternatives: "false",
  geometries: "geojson",
  overview: "simplified",
  steps: "false",
  access_token: mapbox_api_key,
};

/*
axios.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2))
  return request
})
*/


async function route(waypoints) {
  try {
    let url = baseurl;
    for(let i = 0; i < waypoints.length; ++i) {
      url += waypoints[i][0];
      url += "%2C";
      url += waypoints[i][1];
      if(i != waypoints.length-1) {
        url += "%3B";
      }
    }
    return axios.get(url, { params });
  } catch (error) {
    console.log("Error occcured getting route:", error);
  }
}

// taken from https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function getDistanceFromLatLonInKm(start, dest) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(dest[1] - start[1]); // deg2rad below
  var dLon = deg2rad(dest[0] - start[0]);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(start[0])) *
      Math.cos(deg2rad(dest[0])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function pointAlongRouteSumsDistance(line, cutoff) {
  sum = 0;
  idx = 1;
  while (sum < cutoff && idx < line.length) {
    sum += getDistanceFromLatLonInKm(line[idx - 1], line[idx]);
    ++idx;
  }

  if(idx > line.length)
	return idx-1;

  return idx;
}

async function getClosestStation(point) {
  //const s = await getAllDocuments('ev_chargers');
  
  const stations = s.fuel_stations;
  let closest = stations[0];
  let closestPoint = [closest.longitude, closest.latitude];
  let closestDist = getDistanceFromLatLonInKm(point, closestPoint);
  for(let i = 1; i < stations.length; ++i) {
    let testStation = stations[i];
    let testPoint = [testStation.longitude, testStation.latitude];
    let testDist = getDistanceFromLatLonInKm(point, testPoint);
    if(testDist < closestDist) {
      closest = testStation;
      closestPoint = testPoint;
      closestDist = testDist;
    }
  }

  return closest;
}

async function getRouteWithChargers(start, dest, maxDist) {
  let path = await route([start, dest]);
  path = path.data.routes[0].geometry.coordinates;
  let chargers = [];
  let idx = pointAlongRouteSumsDistance(path, maxDist);
  while(idx != path.length) {
    let charger = await getClosestStation(path[idx]);
    let chargerPoint = [charger.longitude, charger.latitude];
    chargers.push(chargerPoint);
    path = await route([chargerPoint, dest]);
    path = path.data.routes[0].geometry.coordinates;
    idx = pointAlongRouteSumsDistance(path, maxDist);
  }
  
  let finalPath = [];
  finalPath.push(path[0], ...chargers, path[1]);
  return await route(finalPath);
}

/*
async function x() {
let y = await getRouteWithChargers([-97.505604,35.468116], [-95.936876,36.146094], 30);
console.log(y);
}

x();
*/
