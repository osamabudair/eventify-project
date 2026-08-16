// --- Imports ---
import React from 'react';

const AuthVisuals = ({ toggleView }) => {
  // --- Main Render ---
  return (
    <div className="overlay-container">
      <div className="overlay">
        
        {/* Floating Background Shapes */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>

        {/* Left Panel (Sign Up / Register View) */}
        <div className="overlay-panel overlay-left">
          <h2>Welcome Back!</h2>
          <p>To keep connected with us please login with your personal info.</p>
          <button className="ghost-btn" onClick={toggleView}>
            Log In
          </button>
        </div>

        {/* Right Panel (Log In View) */}
        <div className="overlay-panel overlay-right">
          <h2>Your Campus Life,<br/>Elevated.</h2>
          <p>Experience the ultimate platform for student activities.</p>
          <button className="ghost-btn" onClick={toggleView}>
            Registration
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default AuthVisuals;