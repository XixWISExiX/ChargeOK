import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import TopNavbar from "./Navbar"; 
import FloatingMenu from "./FloatingMenu"; 

// Set up the custom icon for Leaflet markers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

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

// Component to add the routing machine once the map and route are ready
const RoutingMachine = ({ route }) => {
  const map = useMap();
  const routingControlRef = useRef(null) // Store reference to the routing control

  useEffect(() => {
    if (!map || route.length === 0) return; // Don't proceed if no map or route
      
    // Add the routing control to the map
    routingControlRef.current = L.Routing.control({
      waypoints: route.map(coord => L.latLng(coord[1], coord[0])), // Ensure lat/lng are swapped correctly
      routeWhileDragging: true,
      createMarker: () => null, // Disable default markers
      lineOptions: {
        styles: [{ color: 'blue', weight: 6 }]
      },
      addWaypoints: false, // Disable waypoint editing
      draggableWaypoints: false, // Disable dragging of waypoints
      fitSelectedRoutes: true, // Fit the route to the map
      show: false, // Hide the direction panel completely
      createGeocoder: () => null, // Remove the search bar or address geocoder UI
      itineraryFormatter: { format: () => "" }, // Disable itinerary formatting
      router: L.Routing.osrmv1({ serviceUrl: `https://router.project-osrm.org/route/v1` }), // Disable the instructions panel
    }).addTo(map);

    return () => {
      // Cleanup: remove the routing control safely
      if (routingControlRef.current) {
        routingControlRef.current.getPlan().setWaypoints([]); // Clear waypoints
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null; // Clear the reference
      }
    };
  }, [map, route]);

  return null;
};

// Main map component
const FullScreenMap = () => {
  const [center, setCenter] = useState([35.463418, -97.513828]); // Default center
  const [points, setPoints] = useState([]); // To store the fetched charging locations
  const [selectedPoint, setSelectedPoint] = useState(null); // Track selected point for popup
  const [route, setRoute] = useState([]); // Array of coordinates for the route
  const markerRefs = useRef([]); // Store references to the markers
  
  // Function to handle point selection from FloatingMenu
  const handlePointSelect = (point) => {
    setSelectedPoint(point);
    setCenter([point.lat, point.lng]); // Update map center

    // Find the corresponding marker and open its popup
    const index = points.findIndex(p => p.name === point.name);
    if (index !== -1 && markerRefs.current[index]) {
      markerRefs.current[index].openPopup(); // Open the marker's popup programmatically
    }
  };

  // Fetch charging locations from Overpass API (OpenStreetMap)
  useEffect(() => {
    // Example Overpass API query for EV charging stations within a 50km radius of given lat/lng
    const overpassApiUrl = `
      https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=charging_station](around:250000,35.463418,-97.513828);out;
    `;

    fetch(overpassApiUrl)
      .then(response => response.json())
      .then(data => {
        // Map the API data to the format { lat, lng, name }
        const chargingLocations = data.elements.map(location => ({
          lat: location.lat,
          lng: location.lon,
          name: location.tags.name || "Charging Station"
        }));

        // Set the charging points
        setPoints(chargingLocations);
      })
      .catch(error => console.error("Error fetching charging locations:", error));

    // Load the route with the provided coordinates
    setRoute([
      [-97.513828, 35.463418],
      [-97.51316, 35.463428],
      [-97.513043, 35.462204],
      [-97.501835, 35.461892],
      [-97.501393, 35.460226],
      [-97.495739, 35.462264],
      [-97.486259, 35.444517],
      [-97.486427, 35.425299],
      [-97.495091, 35.402436],
      [-97.496003, 35.375947],
      [-97.490179, 35.333634],
      [-97.489985, 35.298582],
      [-97.485752, 35.284603],
      [-97.485534, 35.216419],
      [-97.481148, 35.207827],
      [-97.48056, 35.204556],
      [-97.444267, 35.203878],
      [-97.444273, 35.205785],
    ]);
  }, []); // Run only once when the component mounts

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
              ref={(ref) => markerRefs.current[index] = ref} // Store marker references
            >
              <Popup>
                {point.name}
              </Popup>
            </Marker>
          ))}

          {/* Center the map to the selected point */}
          {selectedPoint && <MapCenterUpdater point={selectedPoint} />}

          {/* Add the route to the map */}
          {route.length > 0 && <RoutingMachine route={route} />}

        </MapContainer>
      </div>
    </div>
  );
};

export default FullScreenMap;
