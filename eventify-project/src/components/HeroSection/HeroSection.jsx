import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <header className="hero animate-slide-up">
      <h2>Discover & Join <br /><span>The Best Events with Eventify</span></h2>
      <p>An all-in-one platform connecting student clubs and activities. Develop your skills, build your network, and live a passionate campus life.</p>
      <div className="hero-buttons">
        <button className="primary-btn" onClick={() => navigate('/auth')}>Explore Events</button>
        <button className="secondary-btn" onClick={() => navigate('/auth')}>Register Club</button>
      </div>
    </header>
  );
};

export default HeroSection;