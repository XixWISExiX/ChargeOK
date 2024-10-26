import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import "./styling/FloatingMenu.css";
import { useAuth } from "../Auth";

const FloatingMenu = ({ points, onPointSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const { isAdmin } = useAuth();

  const sendFormToBackend = async (data) => {
    try {
      const response = await fetch(
        "https://chargeokserver.netlify.app/.netlify/functions/api/update-charger-queue", // deployment
        // "https://670c6904a6fd21139c29567c--chargeokserver.netlify.app/.netlify/functions/api/update-charger-queue", // draft deployment
        // "http://localhost:9000/.netlify/functions/api/update-charger-queue", // development
        {
          method: "POST", // Specify the HTTP method
          headers: {
            "Content-Type": "application/json", // Tell server to expect JSON data
          },
          body: JSON.stringify(data), // Convert JavaScript object to JSON string
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

  // Get database from backend
  const getChargerQueue = async () => {
    console.log("connecting to backend...");
    fetch(
      "https://chargeokserver.netlify.app/.netlify/functions/api/get-charger-queue" // deployment
      // "https://670c6904a6fd21139c29567c--chargeokserver.netlify.app/.netlify/functions/api/get--charger-queue" // draft deployment
      // "http://localhost:9000/.netlify/functions/api/get-charger-queue" // development
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Frontend", data);
      })
      .catch((error) => {
        console.error("Error fetching point:", error);
      });
  };

  // Toggle main menu visibility
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Handle search input changes
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // Filter points based on the search term
    if (searchValue) {
      const filtered = points.filter((point) =>
        point.name.toLowerCase().includes(searchValue)
      );
      setFilteredPoints(filtered);
    } else {
      setFilteredPoints([]); // Clear the filtered points when search term is empty
    }
  };

  // Handle point selection
  const handlePointSelect = (point) => {
    onPointSelect(point); // Notify parent component
    setSearchTerm(""); // Clear search after selection
    setFilteredPoints([]); // Clear search results after selection
  };

  const handleStationSubmit = async (event) => {
    event.preventDefault(); // Prevents page refresh or default form action
    try {
      await sendFormToBackend({ name: stationName, address: address }); // stores stations in backend
      // TODO: CHANGE THE BELOW LINE TO ONLY ENVOKE VIA ADMIN AND UPDATE DISPLAY
      await getChargerQueue(); // Get stations from backend
    } catch (error) {
      console.error("Error in submission or fetching charger queue:", error);
    }
  };

  return (
    <div className="floating-menu-container">
      {/* Floating search bar with hamburger menu */}
      <div className="menu-header">
        <button
          className="btn hamburger-button"
          type="button"
          aria-expanded={isOpen}
          onClick={toggleMenu}
        >
          {/* Hamburger icon */}
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

      {/* Show filtered points only when there's a search term */}
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

      {/* Show 'No results found' message if there are no matches */}
      {searchTerm && filteredPoints.length === 0 && (
        <p className="no-results">No results found</p>
      )}

      {/* Dropdown menu under the search bar (Accordion section) */}
      {isOpen && (
        <div className="dropdown-menu show">
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Legend</Accordion.Header>
              <Accordion.Body>Filler content for Legend.</Accordion.Body>
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

          {/* Other non-accordion items */}
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
