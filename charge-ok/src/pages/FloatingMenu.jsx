// Import your icons or images here
import ChargingStationIcon from "./Media/charging_location_icon.png"; // Example of a custom icon image
import UserLocationIcon from "./Media/circle-solid.svg"; // Example of another icon image

import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import "./styling/FloatingMenu.css";
import { useAuth } from "../Auth";
import coordFunctions from "./functions/getCoord.js";
const { getCoord, getBestCoord } = coordFunctions;

const FloatingMenu = ({
  mileage,
  setMileage,
  startAddress,
  setStartAddress,
  points,
  onPointSelect,
  handleRouting,
  handleToggle,
  routeError,
  setAddStationError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState([]);
  const [stationName, setStationName] = useState("");
  const [address, setAddress] = useState("");
  const { isAdmin } = useAuth();
  const [endAddress, setEndAddress] = useState("");

  // Define legend items
  const legendItems = [
    { icon: UserLocationIcon, label: "You Are Here" },
    { icon: ChargingStationIcon, label: "EV Charging Station" },
    // Add more items as needed
  ];

  const sendFormToBackend = async (data) => {
    try {
      const response = await fetch(
        "http://localhost:9000/.netlify/functions/api/add-to-charger-queue", // development
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
      await getCoord(address);
      await sendFormToBackend({ name: stationName, address: address }); // stores stations in backend
      setAddStationError(false);
    } catch (error) {
      console.error("Error in submission or fetching charger queue:", error);
      setAddStationError(true);
    }
    setStationName("");
    setAddress("");
  };

  const handleRouteSubmit = async (event) => {
    event.preventDefault(); // Prevents page refresh or default form action
    handleRouting(endAddress); // Notify parent component
    setEndAddress("");
  };

  const handleChargerToggle = async (event) => {
    event.preventDefault(); // Prevents page refresh or default form action
    handleToggle(); // Notify parent component
  };

  const handleStartAddressChange = (e) => {
    const newValue = e.target.value;
    setStartAddress(newValue);
    localStorage.setItem("startAddress", newValue);
  };

  const handleMileageChange = (e) => {
    const newValue = e.target.value;
    setMileage(newValue);
    localStorage.setItem("mileage", newValue);
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
              <Accordion.Body>
                {legendItems.map((item, index) => (
                  <div key={index} className="legend-item">
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="legend-icon"
                    />
                    <span className="legend-label">{item.label}</span>
                  </div>
                ))}
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Filters</Accordion.Header>
              <Accordion.Body>
                <button onClick={handleChargerToggle}>
                  Toggle Charger Display
                </button>
              </Accordion.Body>
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
                    placeholder="Address"
                    required
                    title="Address must be at least 3 characters long and can contain letters, numbers, spaces, commas, periods, and hyphens."
                  />
                  <button type="submit">Submit</button>
                </form>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Set Travel Information</Accordion.Header>
              <Accordion.Body>
                For Start Address, enter in "s" to use current location.
              </Accordion.Body>
              <Accordion.Body>
                <form>
                  <input
                    name="name"
                    type="text"
                    value={startAddress}
                    onChange={handleStartAddressChange}
                    placeholder="Start Address"
                    required
                  />
                  <input
                    name="address"
                    type="number"
                    value={mileage}
                    onChange={handleMileageChange}
                    placeholder="Mileage"
                    required
                  />
                </form>
              </Accordion.Body>
              <Accordion.Body>
                <p>Content of Saved Values</p>
                <div className="add-down-padding">
                  Starting Address: <b>{startAddress}</b>
                </div>
                <div>
                  Maxed Miles Allowed to Travel Before Charging:{" "}
                  <b>{mileage}</b>
                </div>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4">
              <Accordion.Header>Trip Planner</Accordion.Header>
              {routeError && (
                <Accordion.Body>
                  <div className="red-text">
                    Please Enter in More Reasonable <b>Mileage</b> before Route
                    Submission or <b>Valid Address</b>. You might also need to{" "}
                    <b>Wait for your Currenct Location</b> to be loaded in. If
                    you can't, then you cannot reach your destination.
                  </div>
                </Accordion.Body>
              )}
              <Accordion.Body>
                Make sure that you have entered in information into{" "}
                <b>Set Travel Information</b> Category before using this
                feature.
              </Accordion.Body>
              <Accordion.Body>
                <form onSubmit={handleRouteSubmit}>
                  <input
                    name="address"
                    type="text"
                    value={endAddress}
                    onChange={(e) => setEndAddress(e.target.value)}
                    placeholder="Final Address"
                    required
                  />
                  <button type="submit">Submit</button>
                </form>
              </Accordion.Body>
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
