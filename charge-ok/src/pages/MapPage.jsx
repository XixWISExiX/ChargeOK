import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TopNavbar from "./Navbar";
import FloatingMenu from "./FloatingMenu";
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import getRouteWithChargers from "./functions/routing.js";
import RoutingMachine from "./RoutingMachine";
import GetUserLocation from "./GetUserLocation";

// Set up the custom icon for Leaflet markers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// import jsonData from "./front-side-data/ev_chargers.json";

// Create a blue icon for markers
let blueIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});

// Component to update map center
const MapCenterUpdater = ({ point }) => {
  const map = useMap();

  useEffect(() => {
    if (point) {
      map.setView([point.lat, point.lng], 13);
    }
  }, [point, map]);

  return null;
};

// Main map component
const FullScreenMap = () => {
  const [center, setCenter] = useState([35.463418, -97.513828]); // Default center
  const [points, setPoints] = useState([]); // To store the fetched charging locations
  const [selectedPoint, setSelectedPoint] = useState(null); // Track selected point for popup
  const [userCoordinates, setUserCoordinates] = useState(null); // State to store user coordinates
  const [route, setRoute] = useState([]); // Array of coordinates for the route
  const markerRefs = useRef([]); // Store references to the markers

  // Function to handle point selection from FloatingMenu
  const handlePointSelect = (point) => {
    setSelectedPoint(point);
    setCenter([point.lat, point.lng]); // Update map center

    // Find the corresponding marker and open its popup
    const index = points.findIndex((p) => p.name === point.name);
    if (index !== -1 && markerRefs.current[index]) {
      markerRefs.current[index].openPopup(); // Open the marker's popup programmatically
    }
  };

  const handleLocationFound = (coords) => {
    setUserCoordinates(coords);
  };

  // Fetch charging locations from Overpass API (OpenStreetMap)
  useEffect(() => {
    // Accesses json file in the frontend for the charging station locations.
    fetch("./ev_chargers.json") // Fetch from public directory
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((jsonData) => {
        const data = jsonData.fuel_stations;
        const chargingLocations = data.map((location) => ({
          lat: location.latitude,
          lng: location.longitude,
          name: location.station_name || "Charging Station",
        }));
        setPoints(chargingLocations);
      })
      .catch((error) => {
        console.error("Error fetching JSON data:", error);
      });

    // Get database from backend
    // console.log("connecting to backend...");
    // fetch(
    //   "https://chargeokserver.netlify.app/.netlify/functions/api/get-ev-chargers" // deployment
    //   // "https://670c6904a6fd21139c29567c--chargeokserver.netlify.app/.netlify/functions/api/get-ev-chargers" // draft deployment
    //   // "https://4--chargeokserver.netlify.app/.netlify/functions/api/get-ev-chargers" // draft deployment
    //   // "http://localhost:8888/.netlify/functions/api/get-ev-chargers" // development (netlify dev)
    //   // "http://localhost:9000/.netlify/functions/api/get-ev-chargers" // development
    // )
    //   .then((response) => response.json())
    //   .then((data) => {
    //     const chargingLocations = data.map((location) => ({
    //       lat: location.latitude,
    //       lng: location.longitude,
    //       name: location.station_name || "Charging Station",
    //     }));
    //     setPoints(chargingLocations);
    //   })
    //   .catch((error) => {
    //     console.error("Error fetching point:", error);
    //   });

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // const start = userCoordinates || [-97.444273, 35.205785]; // Use userCoordinates or fallback to default
    const start = [-97.444273, 35.205785];
    console.log("you location", userCoordinates);
    // const start = userCoordinates;
    // console.log("you location", start);
    const end = [-97.513828, 35.463418];
    const milesLeft = 30;

    // const route = getRouteWithChargers(start, end, milesLeft);
    // console.log(route);

    const fetchRoute = async () => {
      try {
        const route = await getRouteWithChargers(start, end, milesLeft);
        console.log("1", route); // Now you will see the resolved route data
        // Check if the expected data is available before accessing it
        if (route) {
          const routeList = route.data.routes[0].geometry.coordinates; // Extract coordinates
          console.log("2", routeList); // Logs the coordinates

          setRoute(routeList); // Store the route data
        } else {
          console.error("Route data is incomplete or unavailable.");
        }
      } catch (error) {
        console.error("Error fetching route:", error); // Handle any errors
      }
    };

    // Call the async function to fetch the route
    fetchRoute();

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // Load the route with the provided coordinates
    // setRoute([
    //   [-97.513828, 35.463418],
    //   [-97.51316, 35.463428],
    //   [-97.513043, 35.462204],
    //   [-97.501835, 35.461892],
    //   [-97.501393, 35.460226],
    //   [-97.495739, 35.462264],
    //   [-97.486259, 35.444517],
    //   [-97.486427, 35.425299],
    //   [-97.495091, 35.402436],
    //   [-97.496003, 35.375947],
    //   [-97.490179, 35.333634],
    //   [-97.489985, 35.298582],
    //   [-97.485752, 35.284603],
    //   [-97.485534, 35.216419],
    //   [-97.481148, 35.207827],
    //   [-97.48056, 35.204556],
    //   [-97.444267, 35.203878],
    //   [-97.444273, 35.205785],
    // ]);
  }, []); // Run only once when the component mounts
  // }, [userCoordinates]); // This effect runs every time userCoordinates changes

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Add inline CSS to hide the directions panel */}
      <style>
        {`
          .leaflet-routing-container {
            display: none !important;
          }
        `}
      </style>

      {/* Navbar */}
      <TopNavbar />

      {/* Floating Menu with search functionality */}
      <FloatingMenu points={points} onPointSelect={handlePointSelect} />

      {/* Map Container */}
      <div style={{ flexGrow: 1 }}>
        <MapContainer
          center={center}
          zoom={12} // Adjust zoom to display the area of the points
          style={{ height: "100%", width: "100%" }} // Map fills the remaining space
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Loop through points and display markers */}
          {points.map((point, index) => (
            <Marker
              key={index}
              position={[point.lat, point.lng]}
              icon={blueIcon}
              ref={(ref) => (markerRefs.current[index] = ref)} // Store marker references
            >
              <Popup>{point.name}</Popup>
            </Marker>
          ))}

          {/* Center the map to the selected point */}
          {selectedPoint && <MapCenterUpdater point={selectedPoint} />}

          <GetUserLocation onLocationFound={handleLocationFound} />

          {/* Add the route to the map */}
          {route.length > 0 && <RoutingMachine route={route} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default FullScreenMap;
