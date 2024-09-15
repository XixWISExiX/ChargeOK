import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Modal, Button } from 'react-bootstrap';
import { firebaseAuth } from "../utils/firebase-config";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuth } from '../Auth'; // Adjust the path as necessary
import './styling/Navbar.css'; // Import your custom CSS

const TopNavbar = () => {
  const [navBackground, setNavBackground] = useState('transparent-navbar');
  const [linkColor, setLinkColor] = useState('link-white'); // Manage the link color state
  const [navbarExpanded, setNavbarExpanded] = useState(false); // Track if the navbar is expanded
  const [showModal, setShowModal] = useState(false); // Manage modal visibility
  const [modalType, setModalType] = useState(''); // Track whether to show login or sign-up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const {isLoggedIn, setIsLoggedIn} = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavBackground('opaque-navbar');
        setLinkColor('link-black');
      } else if (!navbarExpanded) {
        setNavBackground('transparent-navbar');
        setLinkColor('link-white');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [navbarExpanded]);

  useEffect(() => {
    if (navbarExpanded) {
      setNavBackground('opaque-navbar');
      setLinkColor('link-black');
    } else if (window.scrollY <= 50) {
      setNavBackground('transparent-navbar');
      setLinkColor('link-white');
    }
  }, [navbarExpanded]);

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

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
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
      handleSwitchModal('login');
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

  return (
    <>
      <Navbar
        expand="lg"
        className={`sticky-navbar ${navBackground}`}
        fixed="top"
        expanded={navbarExpanded}
        onToggle={(expanded) => setNavbarExpanded(expanded)}
      >
        <Container className="size-nav">
          <Navbar.Brand href="/" className={linkColor}>
            <span className="branding">Charge<span className='playpen-sans2'>OK</span></span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className={`ms-auto ${linkColor}`}>
              {!isLoggedIn ? (
                <>
                  <Nav.Link
                    href="#login"
                    className={linkColor}
                    onClick={() => handleShowModal('login')}
                  >
                    Login
                  </Nav.Link>
                  <Nav.Link
                    href="#signup"
                    className={linkColor}
                    onClick={() => handleShowModal('signup')}
                  >
                    Sign-Up
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link
                  href="#logout"
                  className={linkColor}
                  onClick={handleLogout}
                >
                  Logout
                </Nav.Link>
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
        <Modal.Header style={{ backgroundColor: 'black', color: 'white' }} closeButton>
          <Modal.Title>{modalType === 'login' ? 'Login' : 'Sign-Up'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'black', color: 'white' }}>
          {modalType === 'login' ? (
            <form id="login-form" onSubmit={handleLoginSubmit}>
              {error && <p className="error">{error}</p>}
              <div className="mb-3">
                <label htmlFor="loginEmail" className="form-label">Email address</label>
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
                <label htmlFor="loginPassword" className="form-label">Password</label>
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
                <label htmlFor="signupEmail" className="form-label">Email address</label>
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
                <label htmlFor="signupPassword" className="form-label">Password</label>
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
                <label htmlFor="signupConfirmPassword" className="form-label">Confirm Password</label>
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
        <Modal.Footer style={{ backgroundColor: 'black', color: 'white' }}>
          <Button variant="link" onClick={() => handleSwitchModal(modalType === 'login' ? 'signup' : 'login')} style={{ color: '#00CC66', padding: '0', marginRight: 'auto' }}>
            {modalType === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </Button>
          
          <Button variant="secondary" onClick={handleCloseModal} style={{ backgroundColor: 'grey', color: 'white', borderRadius: '5px' }}>
            Close
          </Button>
          <Button
            variant="primary"
            form={modalType === 'login' ? 'login-form' : 'signup-form'}
            type="submit"
            style={{ backgroundColor: '#00CC66', color: 'white', borderRadius: '5px', border: 'none' }}
          >
            {modalType === 'login' ? 'Login' : 'Sign Up'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TopNavbar;
