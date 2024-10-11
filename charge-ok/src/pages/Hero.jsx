import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap'; // Import Button from react-bootstrap
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from './Media/CarDriving.json';
import topRightAnimation from './Media/Location.json'; // Top-right Lottie
import bottomRightAnimation from './Media/ChargingStation.json'; // Bottom-right Lottie
import './styling/Hero.css';

const Hero = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to scroll to the target section
  const handleArrowClick = () => {
    const target = document.getElementById('target-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const navbarHeight = document.querySelector('.sticky-navbar').offsetHeight;
      setTimeout(() => {
        window.scrollBy(0, -navbarHeight);
      }, 500); 
    }
  };

  // Function to navigate to the map page
  const handleMapClick = () => {
    navigate('/map'); // Navigate to the map route
  };

  return (
    <div className="hero-section-wrapper">
      <div className="hero-section">
        <Container className="hero-section-content">
          <Row className="align-items-center w-100">
            <Col md={6} className="hero-text">
              <h1 className='kanit-extrabold'>Charge<span className='playpen-sans'>OK</span></h1>
              <h2 style={{marginBottom: '2px', fontSize:'25px'}}>Empowering Oklahomans. </h2>
              <h2 style={{fontSize:'25px'}}>Map Your Journey with Confidence!</h2>

              {/* Add the button to route to the map page */}
              <Button
                variant="primary"
                style={{ marginTop: '20px' }}
                onClick={handleMapClick}
              >
                Explore Map
              </Button>
            </Col>
            <Col md={6} className="hero-animation">
              <div className="lottie-container">
                {/* Main/center Lottie */}
                <Player
                  autoplay
                  loop
                  src={animationData}
                  style={{ height: '100%', width: '100%' }}
                />

                {/* Top-right Lottie */}
                <Player
                  autoplay
                  loop
                  src={topRightAnimation}
                  style={{ height: '50%', width: '50%' }}
                  className="top-right-lottie"
                />

                {/* Bottom-right Lottie */}
                <Player
                  autoplay
                  loop
                  src={bottomRightAnimation}
                  style={{ height: '100%', width: '100%' }}
                  className="bottom-right-lottie"
                />
              </div>
            </Col>
          </Row>
          <div className="scroll-arrow" onClick={handleArrowClick}></div>
        </Container>
      </div>
    </div>
  );
};

export default Hero;
