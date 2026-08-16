// --- Imports ---
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  // --- Hooks ---
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // --- Main Render ---
  return (
    <nav className="navbar animate-fade-in-down">
      
      {/* Brand Logo */}
      <h1 className="logo">
        Event<span>ify</span>
      </h1>
      
      {/* Navigation Actions */}
      <div className="nav-actions">
        
        {/* Theme Toggle Button */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Authentication Buttons */}
        <button className="login-btn" onClick={() => navigate('/auth')}>
          Log In
        </button>
        <button className="register-btn" onClick={() => navigate('/auth')}>
          Registration
        </button>
        
      </div>
    </nav>
  );
};

export default Navbar;