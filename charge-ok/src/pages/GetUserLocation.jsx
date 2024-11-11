import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.locatecontrol";
import getCoord from "./functions/getCoord.js";

// Component to add user location
const GetUserLocation = ({ onLocationFound, startAddress }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const [coordinates, setCoordinates] = useState(null); // State to store coordinates
  const [circle, setCircle] = useState(null);

  useEffect(() => {
    if (startAddress === "s") {
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

        if (circle) {
          map.removeLayer(circle);
        }

        // Green Circle Icon for User Location
        map.createPane("userLocationMarker");
        map.getPane("userLocationMarker").style.zIndex = 8000;
        markerRef.current = L.circleMarker(ev.latlng, {
          color: "blue", // Border color
          fillColor: "green", // Fill color
          fillOpacity: 1, // Opacity of the fill
          radius: 8, // Radius of the circle
          pane: "userLocationMarker",
        }).addTo(map);
        setCircle(markerRef.current);
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
    } else {
      const fetchStartingAddressInfo = async () => {
        if (startAddress) {
          if (circle) {
            map.removeLayer(circle);
          }
          const coords = await getCoord(startAddress);
          const correctCoords = [coords.latitude, coords.longitude];
          map.createPane("userLocationMarker");
          map.getPane("userLocationMarker").style.zIndex = 8000;
          const marker = L.circleMarker(correctCoords, {
            color: "blue", // Border color
            fillColor: "green", // Fill color
            fillOpacity: 1, // Opacity of the fill
            radius: 8, // Radius of the circle
            pane: "userLocationMarker",
          }).addTo(map);
          setCircle(marker);
        }
      };

      fetchStartingAddressInfo();
    }
  }, [startAddress]);

  return null;
};

export default GetUserLocation;
