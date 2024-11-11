import React, { useEffect, useRef, useState } from "react";
import "leaflet-routing-machine";
import "leaflet.locatecontrol";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Component to add the routing machine once the map and route are ready
const RoutingMachine = ({ route }) => {
  const map = useMap();
  const routingControlRef = useRef(null); // Store reference to the routing control

  useEffect(() => {
    if (!map || route.length === 0) return; // Don't proceed if no map or route

    map.createPane("route");
    map.getPane("route").style.zIndex = 5000;

    // Add the routing control to the map
    routingControlRef.current = L.Routing.control({
      waypoints: route.map((coord) => L.latLng(coord[1], coord[0])), // Ensure lat/lng are swapped correctly
      routeWhileDragging: true,
      createMarker: () => null, // Disable default markers
      lineOptions: {
        // styles: [{ color: "blue", weight: 6, pane: "route" }],
        styles: [{ color: "blue", weight: 6 }], // Doesn't have z index priority
      },
      addWaypoints: false, // Disable waypoint editing
      draggableWaypoints: false, // Disable dragging of waypoints
      fitSelectedRoutes: true, // Fit the route to the map
      show: false, // Hide the direction panel completely
      createGeocoder: () => null, // Remove the search bar or address geocoder UI
      itineraryFormatter: { format: () => "" }, // Disable itinerary formatting
      router: L.Routing.osrmv1({
        // TODO THIS PROBABLY NEEDS TO BE LOOKED AT
        serviceUrl: `https://router.project-osrm.org/route/v1`,
      }), // Disable the instructions panel
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

export default RoutingMachine;
