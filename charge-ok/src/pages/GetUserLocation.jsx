import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.locatecontrol";
import coordFunctions from "./functions/getCoord.js";
const { getCoord, getBestCoord } = coordFunctions;

// Component to add user location
const GetUserLocation = ({ onLocationFound, startAddress, setRouteError }) => {
  const map = useMap();
  const markerRef = useRef(null);
  // const [coordinates, setCoordinates] = useState(null); // State to store coordinates
  const circleRef = useRef(null); // Ref for the circle marker

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
        // setCoordinates(coords);

        if (onLocationFound) {
          onLocationFound(coords);
        }

        // Default Location Icon
        // markerRef.current = L.marker(ev.latlng).addTo(map);

        if (circleRef.current) {
          map.removeLayer(circleRef.current);
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
        // setCircle(markerRef.current);
        circleRef.current = markerRef.current; // Update circle ref
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
    } else if (startAddress) {
      const fetchStartingAddressInfo = async () => {
        try {
          const coords = await getCoord(startAddress);
          if (onLocationFound) {
            onLocationFound(coords);
          }
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

          if (circleRef.current) {
            map.removeLayer(circleRef.current);
          }
          circleRef.current = marker; // Update circle ref
          setRouteError(false);
        } catch {
          setRouteError(true);
        }
      };

      fetchStartingAddressInfo();
    }
  }, [startAddress]);

  return null;
};

export default GetUserLocation;
