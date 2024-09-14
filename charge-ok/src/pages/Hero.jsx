import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Player } from '@lottiefiles/react-lottie-player';
import animationData from './Media/ChargeAni.json';
import './styling/Hero.css';

const Hero = () => {
  const handleArrowClick = () => {
    const target = document.getElementById('target-section');
    if (target) {
      // First scroll the target element into view
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Adjust for the fixed navbar height
      const navbarHeight = document.querySelector('.sticky-navbar').offsetHeight;
      setTimeout(() => {
        window.scrollBy(0, -navbarHeight); // Scroll up by the navbar height
      }, 500); // Adjust this delay based on the scroll duration
    }
  };

  return (
    <div className="hero-section-wrapper">
      <div className="hero-section">
        <Container className="hero-section-content">
          <Row className="align-items-center w-100">
            <Col md={6} className="hero-text">
              <h1 className='kanit-extrabold'>Charge<span className='playpen-sans'>OK</span></h1>
              <p>Empowering Oklahomans. Map Your Journey with Confidence!</p>
            </Col>
            <Col md={6} className="hero-animation">
              <Player
                autoplay
                loop
                src={animationData}
                style={{ height: '40%', width: '40%' }}
              />
            </Col>
          </Row>
          <div className="scroll-arrow" onClick={handleArrowClick}></div> {/* Updated arrow with onClick */}
        </Container>
      </div>
    </div>
  );
};

export default Hero;
