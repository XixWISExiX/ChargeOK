import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Modal,
  Button,
  Tab,
  Tabs,
  ListGroup,
} from "react-bootstrap";
import { firebaseAuth } from "../utils/firebase-config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useAuth } from "../Auth";
import axios from "axios";
import "./styling/Navbar.css";
import { useLocation } from "react-router-dom";
import coordFunctions from "./functions/getCoord.js";
const { getCoord, getBestCoord } = coordFunctions;

const TopNavbar = () => {
  const location = useLocation();
  const isMapPage = location.pathname === "/map";

  const [navBackground, setNavBackground] = useState(
    isMapPage ? "opaque-navbar" : "transparent-navbar"
  );
  const [linkColor, setLinkColor] = useState(
    isMapPage ? "link-black" : "link-white"
  );
  const [navbarExpanded, setNavbarExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false); // New state for Admin modal
  const [modalType, setModalType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [inbox, setInbox] = useState([]); // New state to store inbox requests

  const { isLoggedIn, setIsLoggedIn, isAdmin } = useAuth();

  useEffect(() => {
    if (!isMapPage) {
      const handleScroll = () => {
        if (window.scrollY > 50) {
          setNavBackground("opaque-navbar");
          setLinkColor("link-black");
        } else if (!navbarExpanded) {
          setNavBackground("transparent-navbar");
          setLinkColor("link-white");
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    } else {
      setNavBackground("opaque-navbar");
      setLinkColor("link-black");
    }
  }, [navbarExpanded, isMapPage]);

  useEffect(() => {
    if (navbarExpanded) {
      setNavBackground("opaque-navbar");
      setLinkColor("link-black");
    } else if (window.scrollY <= 50 && !isMapPage) {
      setNavBackground("transparent-navbar");
      setLinkColor("link-white");
    }
  }, [navbarExpanded, isMapPage]);

  const handleSwitchModal = (type) => {
    setModalType(type);
    setError(""); // Clear any existing errors when switching modal types
  };

  const handleShowModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleAdminButtonClick = () => {
    setShowAdminModal(true); // Open the admin panel modal
    fetchInbox(); // Fetch inbox requests when opening the modal
  };

  const handleCloseAdminModal = () => {
    setShowAdminModal(false); // Close the admin panel modal
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      setIsLoggedIn(true);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
      handleSwitchModal("login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(firebaseAuth);
      setIsLoggedIn(false);
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  // Fetch inbox data from the server
  const fetchInbox = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9000/.netlify/functions/api/get-charger-queue" // development
      );
      console.log("Charging Station Additions Requesed JSON:", response.data);
      setInbox(response.data); // Assume response.data is an array of requests
    } catch (error) {
      console.error("Error fetching inbox requests:", error);
    }
  };

  const handleApproveRequest = async (name, address) => {
    console.log("Approve Request:", name, address);

    try {
      // Make sure address is valid
      const addressPattern =
        /(\d+)\s+([A-Za-z]+(?:\s[A-Za-z]+)*)(?:\s(Street|Ave|Blvd|Drive|Lane|Road|St|Rd))?/;
      if (addressPattern.test(address) === false) {
        console.log("Address is not Recognizable");
        const e = 1 / 0;
      }
      const coordinates = await getCoord(address);
      console.log("GPS Coords", coordinates);

      const response = await axios.post(
        "http://localhost:9000/.netlify/functions/api/add-ev-charger", // development
        {
          method: "POST", // Specify the HTTP method
          headers: {
            "Content-Type": "application/json", // Tell server to expect JSON data
          },
          body: JSON.stringify({ name, coordinates }), // Convert JavaScript object to JSON string
        }
      );
      if (response.ok) {
        console.log("Request processed");
      } else {
        console.error("Error:", response.statusText);
      }
      fetchInbox();
    } catch (error) {
      console.error("Error fetching inbox requests:", error);
    }

    // Gets rid of the request after it's processed
    await handleRejectRequest(name, address);
  };

  const handleRejectRequest = async (name, address) => {
    console.log("Rejected Request:", name, address);
    try {
      const response = await axios.post(
        "http://localhost:9000/.netlify/functions/api/remove-from-charger-queue", // development
        {
          method: "POST", // Specify the HTTP method
          headers: {
            "Content-Type": "application/json", // Tell server to expect JSON data
          },
          body: JSON.stringify({ name, address }), // Convert JavaScript object to JSON string
        }
      );
      if (response.ok) {
        console.log("Request processed");
      } else {
        console.error("Error:", response.statusText);
      }
      fetchInbox();
    } catch (error) {
      console.error("Error fetching inbox requests:", error);
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        className={`sticky-navbar ${navBackground} ${
          isMapPage ? "" : "fixed-navbar"
        }`}
        fixed={isMapPage ? false : "top"}
        expanded={navbarExpanded}
        onToggle={(expanded) => setNavbarExpanded(expanded)}
      >
        <Container className="size-nav">
          <Navbar.Brand href="/ChargeOK" className={linkColor}>
            <span className="branding">
              Charge<span className="playpen-sans2">OK</span>
            </span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className={`ms-auto ${linkColor}`}>
              {!isLoggedIn ? (
                <>
                  <Nav.Link
                    href="#login"
                    className={linkColor}
                    onClick={() => handleShowModal("login")}
                  >
                    Login
                  </Nav.Link>
                  <Nav.Link
                    href="#signup"
                    className={linkColor}
                    onClick={() => handleShowModal("signup")}
                  >
                    Sign-Up
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link
                    href="#logout"
                    className={linkColor}
                    onClick={handleLogout}
                  >
                    Logout
                  </Nav.Link>
                  {isAdmin && (
                    <Nav.Link
                      href="#admin"
                      className={linkColor}
                      onClick={handleAdminButtonClick}
                    >
                      Admin Panel
                    </Nav.Link>
                  )}
                </>
              )}
              <NavDropdown
                title={<span className={linkColor}>More</span>}
                id="basic-nav-dropdown"
                className={linkColor}
              >
                <NavDropdown.Item className={linkColor} href="#/action-1">
                  About Us
                </NavDropdown.Item>
                <NavDropdown.Item className={linkColor} href="#/action-2">
                  Support
                </NavDropdown.Item>
                <NavDropdown.Item className={linkColor} href="#/action-3">
                  FAQ
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className={linkColor} href="#/action-4">
                  Patch Notes
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

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
            <form id="login-form" onSubmit={handleLoginSubmit}>
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
            </form>
          ) : (
            <form id="signup-form" onSubmit={handleSignupSubmit}>
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
            </form>
          )}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "black", color: "white" }}>
          <Button
            variant="link"
            onClick={() =>
              handleSwitchModal(modalType === "login" ? "signup" : "login")
            }
            style={{ color: "#00CC66", padding: "0", marginRight: "auto" }}
          >
            {modalType === "login"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Log In"}
          </Button>
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
            form={modalType === "login" ? "login-form" : "signup-form"}
            type="submit"
            style={{
              backgroundColor: "#00CC66",
              color: "white",
              borderRadius: "5px",
              border: "none",
            }}
          >
            {modalType === "login" ? "Login" : "Sign Up"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Admin Panel */}
      <Modal
        show={showAdminModal}
        onHide={handleCloseAdminModal}
        centered
        dialogClassName="admin-modal"
      >
        <Modal.Header
          style={{ backgroundColor: "black", color: "white" }}
          closeButton
        >
          <Modal.Title>Admin Panel</Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{ backgroundColor: "black", color: "white", padding: "20px" }}
        >
          <Tabs
            defaultActiveKey="inbox"
            id="admin-panel-tabs"
            className="mb-3"
            style={{ borderBottom: "1px solid white" }}
          >
            <Tab eventKey="inbox" title="Inbox">
              <ListGroup variant="flush" style={{ backgroundColor: "black" }}>
                {inbox.length > 0 ? (
                  inbox.map((request, index) => (
                    <ListGroup.Item
                      key={index}
                      style={{
                        backgroundColor: "black",
                        color: "white",
                        border: "1px solid gray",
                        marginBottom: "5px",
                      }}
                    >
                      <strong>Station Name:</strong> {request.name} <br />
                      <strong>Address:</strong> {request.address} <br />
                      <Button
                        variant="success"
                        size="sm"
                        className="mt-2 me-2"
                        onClick={() =>
                          handleApproveRequest(request.name, request.address)
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          handleRejectRequest(request.name, request.address)
                        }
                      >
                        Reject
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <p style={{ color: "white", padding: "10px" }}>
                    No new requests.
                  </p>
                )}
              </ListGroup>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "black", color: "white" }}>
          <Button
            variant="secondary"
            onClick={handleCloseAdminModal}
            style={{
              backgroundColor: "grey",
              color: "white",
              borderRadius: "5px",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TopNavbar;
