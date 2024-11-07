import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.locatecontrol";
// Component to add user location
const GetUserLocation = ({ onLocationFound }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const [coordinates, setCoordinates] = useState(null); // State to store coordinates

  useEffect(() => {
    const locateControl = L.control
      .locate({
        position: "topleft",
        setView: false,
        cacheLocation: false,
        locateOptions: {
          enableHighAccuracy: true,
        },
        // Disable the default blue marker and circle
        drawCircle: false, // Disable the circle
        drawMarker: false, // Disable the default marker
      })
      .addTo(map);

    map.once("locationfound", function (ev) {
      const coords = [ev.latlng.lng, ev.latlng.lat];
      setCoordinates(coords);

      if (onLocationFound) {
        onLocationFound(coords);
      }

      // Default Location Icon
      // markerRef.current = L.marker(ev.latlng).addTo(map);

      // Temporary circle icon
      markerRef.current = L.circleMarker(ev.latlng, {
        color: "green", // Border color
        fillColor: "green", // Fill color
        fillOpacity: 0.5, // Opacity of the fill
        radius: 10, // Radius of the circle
      }).addTo(map);
    });

    map.on("locationerror", function (err) {
      console.error("Location error:", err);
    });

    locateControl.start();

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      locateControl.stop();
      locateControl.remove();
      map.off("locationfound");
      map.off("locationerror");
    };
  }, [map]);

  return null;
};

export default GetUserLocation;
