import React, { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const GetFinalLocation = ({ endPoint }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const [circle, setCircle] = useState(null);
  useEffect(() => {
    // var circle = L.circleMarker([35.463418, -97.513828], {
    if (endPoint) {
      if (circle) {
        map.removeLayer(circle);
      }
      map.createPane("finalLocationMarker");
      map.getPane("finalLocationMarker").style.zIndex = 8000;
      const marker = L.circleMarker(endPoint, {
        //   var circle = L.circleMarker([35.463418, -97.513828], {
        color: "blue", // Circle color
        fillColor: "red", // Fill color
        fillOpacity: 1, // Opacity of the fill
        radius: 8, // Radius in meters
        pane: "finalLocationMarker",
      }).addTo(map);
      setCircle(marker);
    }
  }, [map, endPoint]);
  return null;
};

export default GetFinalLocation;
