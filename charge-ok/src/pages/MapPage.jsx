import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TopNavbar from "./Navbar";
import FloatingMenu from "./FloatingMenu";

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

  // Fetch charging locations from Overpass API (OpenStreetMap)
  useEffect(() => {
    console.log("connecting to backend...");

    // const jsonData = JSON.parse(
    //   fs.readFileSync("../../netlify-express/data/ev_chargers.json", "utf-8")
    // );
    // const data = jsonData.fuel_stations;
    // const chargingLocations = data.map((location) => ({
    //   lat: location.latitude,
    //   lng: location.longitude,
    //   name: location.station_name || "Charging Station",
    // }));
    // setPoints(chargingLocations);
    fetch(
      "https://chargeokserver.netlify.app/.netlify/functions/api/get-ev-chargers" // deployment
      // "https://670c6904a6fd21139c29567c--chargeokserver.netlify.app/.netlify/functions/api/get-ev-chargers" // draft deployment
      // "https://4--chargeokserver.netlify.app/.netlify/functions/api/get-ev-chargers" // draft deployment
      // "http://localhost:8888/.netlify/functions/api/get-ev-chargers" // development (netlify dev)
      // "http://localhost:9000/.netlify/functions/api/get-ev-chargers" // development
    )
      .then((response) => response.json())
      .then((data) => {
        const chargingLocations = data.map((location) => ({
          lat: location.latitude,
          lng: location.longitude,
          name: location.station_name || "Charging Station",
        }));
        setPoints(chargingLocations);
      })
      .catch((error) => {
        console.error("Error fetching point:", error);
      });
  }, []); // Run only once when the component mounts

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
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
        </MapContainer>
      </div>
    </div>
  );
};

export default FullScreenMap;
