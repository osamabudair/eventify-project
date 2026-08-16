// --- Imports ---
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  // --- Hooks ---
  const navigate = useNavigate();

  // --- Main Render ---
  return (
    <header className="hero animate-slide-up">
      
      {/* Hero Content */}
      <h2>
        Discover & Join <br />
        <span>The Best Events with Eventify</span>
      </h2>
      <p>
        An all-in-one platform connecting student clubs and activities. Develop your skills, build your network, and live a passionate campus life.
      </p>
      
      {/* Hero Actions */}
      <div className="hero-buttons">
        <button className="primary-btn" onClick={() => navigate('/explore')}>
          Explore Events
        </button>
        <button className="secondary-btn" onClick={() => navigate('/auth')}>
          Register Club
        </button>
      </div>

    </header>
  );
};

export default HeroSection;