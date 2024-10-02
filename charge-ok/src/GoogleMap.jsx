import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseAuth } from "./utils/firebase-config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Dropdown, DropdownButton, Modal, Button } from "react-bootstrap";
import { useAuth } from "./Auth"; // Adjust the path as necessary
import "./pages/styling/GoogleMap.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let blueIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41], // Anchor the icon properly
});

L.Marker.prototype.options.icon = blueIcon;

const createTextIcon = (text) => {
  return L.divIcon({
    html: `<div style="position: relative; text-align: center;">
                  <img src="${icon}"/>
                  <span style="color: black; font-weight: bold; font-size: 0.75rem; white-space: nowrap;">${text}</span>
               </div>`,
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41], // Adjust size
    iconAnchor: [12, 41], // Anchor it properly (centered at the bottom)
    className: "", // Clear any default styles
  });
};

const MapCenterUpdater = ({ point }) => {
  const map = useMap(); // Access the map instance

  useEffect(() => {
    if (point) {
      // If the point is defined, update the map center
      map.setView([point.lat, point.lng], 13); // You can adjust the zoom as needed
    }
  }, [point, map]);

  return null;
};

const MyMap = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [point, setPoint] = useState(null);
  const [center, setCenter] = useState([37.7749, -122.4194]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the URL for the iframe from the backend
    // fetch(
    // "https://66e76d94bc17b47389f08ad4--chargeokserver.netlify.app/.netlify/functions/api/generate-iframe-url"
    // ) // Deployment only

    // fetch("http://localhost:9000/.netlify/functions/api/generate-iframe-url") // Development only
    // .then((response) => response.json())
    // .then((data) => setIframeUrl(data.url))
    // .catch((error) => console.error("Error fetching iframe URL:", error));

    fetch("http://localhost:9000/.netlify/functions/api/get-point") // Development only
      .then((response) => response.json())
      .then((data) => {
        setPoint(data);
        setCenter([data.lat, data.lng]);
        // setCenter(data);
      })
      .catch((error) => {
        console.error("Error fetching point:", error);
      });
  }, []);

  const handleShowModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSwitchModal = (type) => {
    setModalType(type);
    setError(""); // Reset error state when switching between modals
  };

  const handleLoginPrompt = () => {
    handleShowModal("login");
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Reset error state before submission

    try {
      // Firebase sign-in with email and password
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      alert("Login successful!");
      setIsLoggedIn(true); // Set the user as logged in
      setShowModal(false); // Close the modal after successful login
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setError(""); // Reset error state before submission

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Firebase sign-up with email and password
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      alert("Sign-up successful!");
      handleSwitchModal("login"); // Switch to login modal after successful sign-up
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTripHistoryClick = () => {
    if (isLoggedIn) {
      // Implement the Trip History functionality here
      console.log("Accessing Trip History");
    } else {
      handleLoginPrompt();
    }
  };

  const handleSaveChargersClick = () => {
    if (isLoggedIn) {
      // Implement the Save Chargers functionality here
      console.log("Accessing Save Chargers");
    } else {
      handleLoginPrompt();
    }
  };

  return (
    <div className="map-wrapper" id="target-section">
      <div className="island">
        <h2>Route your trip</h2>
        <div className="search-bar-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search for Locations"
          />
          <button className="filter-button">Filter</button>
          <span id="dropdown">
            <DropdownButton
              id="dropdown-basic-button"
              title="More Options"
              variant="success" // Set the button color
              className="ml-3"
            >
              <Dropdown.Item onClick={handleTripHistoryClick}>
                Trip History
              </Dropdown.Item>
              <Dropdown.Item onClick={handleSaveChargersClick}>
                Save Chargers
              </Dropdown.Item>
            </DropdownButton>
          </span>
        </div>
      </div>
      <div className="map-container">
        <MapContainer
          center={center} // Default center
          zoom={13}
          style={{ height: "100vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {point && (
            <>
              <Marker
                position={[point.lat, point.lng]}
                icon={createTextIcon(point.name)}
                // icon={blueIcon}
              >
                <Popup>Point location</Popup>
                <Tooltip>{point.name}</Tooltip>{" "}
                {/* Add this line for the tooltip */}
                {/* icon={createTextIcon(point.name)} */}
              </Marker>

              <MapCenterUpdater point={point} />
            </>
          )}
        </MapContainer>
        {/* <iframe
          title="Google Map"
          className="map"
          frameBorder="0"
          style={{ border: 0 }}
          referrerPolicy="no-referrer-when-downgrade"
          src={iframeUrl}
          allowFullScreen
        ></iframe> */}
      </div>

      {/* Modal for Login/Sign-Up */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header
          style={{ backgroundColor: "black", color: "white" }}
          closeButton
        >
          <Modal.Title>
            {modalType === "login" ? "Login" : "Sign-Up"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "black", color: "white" }}>
          {modalType === "login" ? (
            <form onSubmit={handleLoginSubmit}>
              {error && <p className="error">{error}</p>}
              <div className="mb-3">
                <label htmlFor="loginEmail" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="loginEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="loginPassword" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="loginPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                variant="link"
                style={{ color: "#00CC66", padding: "0", marginTop: "10px" }}
                onClick={() => handleSwitchModal("signup")}
              >
                Don't have an account? Sign Up
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit}>
              {error && <p className="error">{error}</p>}
              <div className="mb-3">
                <label htmlFor="signupEmail" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="signupEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="signupPassword" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="signupPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="signupConfirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="signupConfirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                variant="link"
                style={{ color: "#00CC66", padding: "0", marginTop: "10px" }}
                onClick={() => handleSwitchModal("login")}
              >
                Already have an account? Log In
              </Button>
            </form>
          )}
        </Modal.Body>

        <Modal.Footer style={{ backgroundColor: "black", color: "white" }}>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            style={{
              backgroundColor: "grey",
              color: "white",
              borderRadius: "5px",
            }}
          >
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={modalType === "login" ? "login-form" : "signup-form"}
            onClick={
              modalType === "login" ? handleLoginSubmit : handleSignupSubmit
            } // Submit the appropriate form when clicking the button
            style={{
              backgroundColor: "#00CC66",
              color: "white",
              borderRadius: "5px",
              border: "none",
            }}
          >
            {modalType === "login" ? "Login" : "Sign-Up"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyMap;
