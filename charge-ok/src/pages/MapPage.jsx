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
import GetFinalLocation from "./GetFinalLocation";
import { useAuth } from "../Auth";
import "./styling/MapPage.css";

// Set up the custom icon for Leaflet markers
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import coordFunctions from "./functions/getCoord.js";
const { getCoord, getBestCoord } = coordFunctions;

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
  const { userId } = useAuth();
  const [pointDisplay, setPointDisplay] = useState(true);
  const [startAddress, setStartAddress] = useState(
    localStorage.getItem("startAddress")
  );
  const [mileage, setMileage] = useState(localStorage.getItem("mileage"));
  const [endPoint, setEndPoint] = useState(null);
  const [routeError, setRouteError] = useState(false);
  const [chargerListJSON, setChargerListJSON] = useState(false);
  const [addStationError, setAddStationError] = useState(false);
  const [rerender, setRerender] = useState(false);
  const floatingMenuRef = useRef(null); // Create a ref for FloatingMenu

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
    // fetch("./ev_chargers.json") // Fetch from public directory
    fetch(
      "http://localhost:9000/.netlify/functions/api/get-ev-chargers" // development
    ) // Fetch from public directory
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((jsonData) => {
        console.log("EV Charging Station JSON:", jsonData);
        const data = jsonData.fuel_stations;
        const chargingLocations = data.map((location) => ({
          lat: location.latitude,
          lng: location.longitude,
          name: location.station_name || "Charging Station",
        }));
        setPoints(chargingLocations);
        setChargerListJSON(jsonData);
      })
      .catch((error) => {
        console.error("Error fetching JSON data:", error);
      });
    const myStartAddress = localStorage.getItem("startAddress");
    if (myStartAddress === null || myStartAddress === undefined) {
      localStorage.setItem("startAddress", "s");
    } // Sets start address to user location by default
    setStartAddress(localStorage.getItem("startAddress"));

    const myMileage = localStorage.getItem("mileage");
    if (myMileage === null || myMileage === undefined) {
      localStorage.setItem("mileage", 10000);
    } // Sets mileage to 10000 by default (doesn't look at charging stations)
    setMileage(localStorage.getItem("mileage"));
    // }, [userId, userCoordinates]); // Run only once when the userId Is obtained or user coordinates change
    setRerender(false);
  }, [rerender]); // Run only once when the component mounts
  // }, [userCoordinates]); // This effect runs every time userCoordinates changes

  const handleChargerToggle = async () => {
    setPointDisplay(!pointDisplay);
  };

  const fetchRoute = async (end) => {
    try {
      let start;
      if (startAddress === "s") {
        start = userCoordinates;
      } else {
        const startObj = await getCoord(startAddress);
        start = [startObj.longitude, startObj.latitude];
      }
      const milesLeft = mileage;
      const route = await getRouteWithChargers(start, end, milesLeft);
      // Check if the expected data is available before accessing it
      if (route) {
        // if (route == null) throw Error;
        const routeList = route.routes[0].geometry.coordinates; // Extract coordinates
        console.log("Route List:", routeList); // Logs the coordinates

        setRoute(routeList); // Store the route data
        setEndPoint([end[1], end[0]]);
        setRouteError(false);
      } else {
        console.error("Route data is incomplete or unavailable.");
        setRouteError(true);
      }
    } catch (error) {
      console.error("Error fetching route:", error); // Handle any errors
      setRouteError(true);
    }
  };

  // const handleRoutingSubmit = async (startAddress, endAddress, mileage) => {
  const handleRoutingSubmit = async (endAddress) => {
    try {
      const end = await getCoord(endAddress);
      fetchRoute([end.longitude, end.latitude]);
    } catch {
      setRouteError(true);
    }
  };

  const handleChargerRoute = async (pointLatitude, pointLongitude) => {
    const end = [pointLongitude, pointLatitude];
    if (end[0] && end[1]) {
      fetchRoute(end);
    }
  };

  useEffect(() => {
    if (addStationError) {
      // Set a timeout to hide the error after 10 seconds
      const timer = setTimeout(() => {
        setAddStationError(false); // Hide the error message
      }, 10000);

      // Cleanup timeout if the component unmounts or if the error changes before 5 seconds
      return () => clearTimeout(timer);
    }
  }, [addStationError]);

  useEffect(() => {
    if (routeError) {
      // Set a timeout to hide the error after 10 seconds
      const timer = setTimeout(() => {
        setRouteError(false); // Hide the error message
      }, 10000);

      // Cleanup timeout if the component unmounts or if the error changes before 5 seconds
      return () => clearTimeout(timer);
    }
  }, [routeError]);

  useEffect(() => {
    if (routeError && addStationError) {
      floatingMenuRef.current.classList.add("error-floating-menu-all");
    } else if (routeError) {
      floatingMenuRef.current.classList.add("error-floating-menu-route");
    } else if (addStationError) {
      floatingMenuRef.current.classList.add("error-floating-menu-station");
    }

    if (!routeError) {
      floatingMenuRef.current.classList.remove("error-floating-menu-route");
      floatingMenuRef.current.classList.remove("error-floating-menu-all");
    }
    if (!addStationError) {
      floatingMenuRef.current.classList.remove("error-floating-menu-station");
      floatingMenuRef.current.classList.remove("error-floating-menu-all");
    }
  }, [routeError, addStationError]); // Only run when errors change

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Add inline CSS to hide the directions panel */}
      <style>
        {`
          .leaflet-routing-container {
            display: none !important;
          }

          .leaflet-popup-pane, .leaflet-popup, .leaflet-popup-content-wrapper {
          z-index: 10000 !important;
        }
        
        `}
      </style>

      {/* Navbar */}
      <TopNavbar setRerender={setRerender} />

      {addStationError && (
        <div className="error-text">
          Please Submit A Correct Address when Adding a Station.
        </div>
      )}

      {routeError && (
        <div className="error-text">
          Please Enter in More Reasonable <b>Mileage</b> before Route Submission
          or <b>Valid Address</b>. You might also need to{" "}
          <b>Wait for your Currenct Location</b> to be loaded in. If you can't,
          then you cannot reach your destination.
        </div>
      )}

      {/* Floating Menu with search functionality */}
      {/* {!routeError && !addStationError && (
        <FloatingMenu
          mileage={mileage}
          setMileage={setMileage}
          startAddress={startAddress}
          setStartAddress={setStartAddress}
          points={points}
          onPointSelect={handlePointSelect}
          handleRouting={handleRoutingSubmit}
          handleToggle={handleChargerToggle}
          routeError={routeError}
          setAddStationError={setAddStationError}
        />
      )}
      {(routeError || addStationError) && (
        <div className="error-floating-menu">
          <FloatingMenu
            mileage={mileage}
            setMileage={setMileage}
            startAddress={startAddress}
            setStartAddress={setStartAddress}
            points={points}
            onPointSelect={handlePointSelect}
            handleRouting={handleRoutingSubmit}
            handleToggle={handleChargerToggle}
            routeError={routeError}
            setAddStationError={setAddStationError}
          />
        </div>
      )} */}

      <FloatingMenu
        ref={floatingMenuRef}
        mileage={mileage}
        setMileage={setMileage}
        startAddress={startAddress}
        setStartAddress={setStartAddress}
        points={points}
        onPointSelect={handlePointSelect}
        handleRouting={handleRoutingSubmit}
        handleToggle={handleChargerToggle}
        routeError={routeError}
        setAddStationError={setAddStationError}
        addStationError={addStationError}
      />

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
          {(pointDisplay || !rerender) &&
            points.map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={blueIcon}
                ref={(ref) => (markerRefs.current[index] = ref)} // Store marker references
              >
                <Popup>
                  <div className="icon-header">
                    <div className="add-bottom-padding">{point.name}</div>
                    <button
                      onClick={() => handleChargerRoute(point.lat, point.lng)}
                    >
                      Show Route
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

          <GetUserLocation
            onLocationFound={handleLocationFound}
            startAddress={startAddress}
            setRouteError={setRouteError}
          />
          <GetFinalLocation endPoint={endPoint} />

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
