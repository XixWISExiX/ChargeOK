import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import "./styling/FloatingMenu.css";
import { useAuth } from "../Auth";

// Import your icons or images here
import ChargingStationIcon from "./Media/charging_location_icon.png"; // Example of a custom icon image
import UserLocationIcon from "./Media/circle-solid.svg"; // Example of another icon image

const FloatingMenu = ({ points, onPointSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const { isAdmin } = useAuth();

  // Define legend items
  const legendItems = [
    
    { icon: UserLocationIcon, label: "You Are Here" },
    { icon: ChargingStationIcon, label: "EV Charging Station" },
    // Add more items as needed
  ];

  const sendFormToBackend = async (data) => {
    try {
      const response = await fetch(
        "https://chargeokserver.netlify.app/.netlify/functions/api/update-charger-queue",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getChargerQueue = async () => {
    console.log("connecting to backend...");
    fetch("https://chargeokserver.netlify.app/.netlify/functions/api/get-charger-queue")
      .then((response) => response.json())
      .then((data) => {
        console.log("Frontend", data);
      })
      .catch((error) => {
        console.error("Error fetching point:", error);
      });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    if (searchValue) {
      const filtered = points.filter((point) =>
        point.name.toLowerCase().includes(searchValue)
      );
      setFilteredPoints(filtered);
    } else {
      setFilteredPoints([]);
    }
  };

  const handlePointSelect = (point) => {
    onPointSelect(point);
    setSearchTerm("");
    setFilteredPoints([]);
  };

  const handleStationSubmit = async (event) => {
    event.preventDefault();
    try {
      await sendFormToBackend({ name: stationName, address: address });
      await getChargerQueue();
    } catch (error) {
      console.error("Error in submission or fetching charger queue:", error);
    }
  };

  return (
    <div className="floating-menu-container">
      <div className="menu-header">
        <button
          className="btn hamburger-button"
          type="button"
          aria-expanded={isOpen}
          onClick={toggleMenu}
        >
          <div className={`bar ${isOpen ? "open" : ""}`}></div>
          <div className={`bar ${isOpen ? "open" : ""}`}></div>
          <div className={`bar ${isOpen ? "open" : ""}`}></div>
        </button>

        <input
          type="text"
          className="form-control search-input"
          placeholder="Search for a Charging Location"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {searchTerm && filteredPoints.length > 0 && (
        <ul className="search-results-list">
          {filteredPoints.map((point, index) => (
            <li
              key={index}
              className="search-result-item"
              onClick={() => handlePointSelect(point)}
            >
              {point.name}
            </li>
          ))}
        </ul>
      )}

      {searchTerm && filteredPoints.length === 0 && (
        <p className="no-results">No results found</p>
      )}

      {isOpen && (
        <div className="dropdown-menu show">
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Legend</Accordion.Header>
              <Accordion.Body>
                {legendItems.map((item, index) => (
                  <div key={index} className="legend-item">
                    <img src={item.icon} alt={item.label} className="legend-icon" />
                    <span className="legend-label">{item.label}</span>
                  </div>
                ))}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Filters</Accordion.Header>
              <Accordion.Body>Filler content for Filters.</Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Add Station</Accordion.Header>
              {isAdmin && <Accordion.Body>Your An Admin</Accordion.Body>}
              <Accordion.Body>
                <form onSubmit={handleStationSubmit}>
                  <input
                    name="name"
                    type="text"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    placeholder="Station Name"
                    required
                  />
                  <input
                    name="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="address"
                    required
                  />
                  <button type="submit">Submit</button>
                </form>
              </Accordion.Body>
              <Accordion.Body>Filler content for Add Station.</Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Trip Planner</Accordion.Header>
              <Accordion.Body>Filler content for Trip Planner.</Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <ul className="list-unstyled mb-0">
            <li className="dropdown-item">
              <a href="#">Plan a New Trip</a>
            </li>
            <li className="dropdown-item">
              <a href="#">Recent Activity</a>
            </li>
            <li className="dropdown-item">
              <a href="#">Settings</a>
            </li>
            <li className="dropdown-item">
              <a href="#">Help</a>
            </li>
            <li className="dropdown-item">
              <a href="#">Submit Feedback</a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;
