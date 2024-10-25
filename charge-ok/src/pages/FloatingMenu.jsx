import React, { useState } from "react";
import { Accordion } from "react-bootstrap";
import "./styling/FloatingMenu.css";
import { useAuth } from "../Auth";

const FloatingMenu = ({ points, onPointSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPoints, setFilteredPoints] = useState([]);
  const { isAdmin } = useAuth();

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
