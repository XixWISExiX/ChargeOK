import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import TopNavbar from "./Navbar"; 
import FloatingMenu from "./FloatingMenu"; 
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";

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

// Component to add locate control
const AddLocateControl = () => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    const locateControl = L.control.locate({
      position: 'topleft',
      strings: {
        title: "Show me where I am, yo!"
      },
      setView: false,
      cacheLocation: false,
      locateOptions: {
        enableHighAccuracy: true
      }
    }).addTo(map);

    map.once('locationfound', function(ev) {
      const coords = [ev.latlng.lng, ev.latlng.lat];
      console.log("User location:", coords);
      markerRef.current = L.marker(ev.latlng).addTo(map);
    });

    map.on('locationfound', function(ev) {
      if (markerRef.current) {
        markerRef.current.setLatLng(ev.latlng);
      }
    });

    map.on('locationerror', function(err) {
      console.error('Location error:', err);
    });

    locateControl.start();

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      locateControl.stop();
      locateControl.remove();
      map.off('locationfound');
      map.off('locationerror');
    };
  }, [map]);

  return null;
};



// Main map component
const FullScreenMap = () => {
  const [center, setCenter] = useState([35.463418, -97.513828]);
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const markerRefs = useRef([]);

  // Function to handle point selection from FloatingMenu
  const handlePointSelect = (point) => {
    setSelectedPoint(point);
    setCenter([point.lat, point.lng]);

    const index = points.findIndex(p => p.name === point.name);
    if (index !== -1 && markerRefs.current[index]) {
      markerRefs.current[index].openPopup();
    }
  };

  // Fetch charging locations from Overpass API
  useEffect(() => {
    const overpassApiUrl = `
      https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=charging_station](around:250000,35.463418,-97.513828);out;
    `;

    fetch(overpassApiUrl)
      .then(response => response.json())
      .then(data => {
        const chargingLocations = data.elements.map(location => ({
          lat: location.lat,
          lng: location.lon,
          name: location.tags.name || "Charging Station"
        }));

        setPoints(chargingLocations);
      })
      .catch(error => console.error("Error fetching charging locations:", error));
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNavbar />
      <FloatingMenu points={points} onPointSelect={handlePointSelect} />
      <div style={{ flexGrow: 1 }}>
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {points.map((point, index) => (
            <Marker
              key={index}
              position={[point.lat, point.lng]}
              icon={blueIcon}
              ref={(ref) => markerRefs.current[index] = ref}
            >
              <Popup>
                {point.name}
              </Popup>
            </Marker>
          ))}
          {selectedPoint && <MapCenterUpdater point={selectedPoint} />}
          <AddLocateControl />
        </MapContainer>
      </div>
    </div>
  );
};

export default FullScreenMap;
