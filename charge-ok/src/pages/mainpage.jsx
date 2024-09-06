import GoogleMap from "../GoogleMap";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import './Mainpage.css'; // Import the CSS file for styling

export default function Mainpage() {
  const [users, setUsers] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from the backend API
    fetch("http://localhost:5000/api/users")
      .then((response) => {
        console.log("Response:", response); // Log the response object
        return response.json();
      })
      .then((data) => {
        console.log("Data:", data); // Log the fetched data
        setUsers(data);
      })
      .catch((error) => console.error("Error fetching users:", error));

    // Event listener to close the dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <div className="main-container">
      {/* Dropdown Menu in Top Left Corner */}
      <div className="dropdown-container" ref={dropdownRef}>
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          Menu
        </button>
        {dropdownVisible && (
          <div className="dropdown-menu">
            <button className="dropdown-item" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="dropdown-item" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </div>
        )}
      </div>

      <h1>Users</h1>
      <ul>
        {users.length > 0 ? (
          users.map((user) => <li key={user.id}>{user.name}</li>)
        ) : (
          <li>No users found</li>
        )}
      </ul>

      <div>test</div>

      <div className="map-container">
        <GoogleMap />
      </div>
    </div>
  );
}
