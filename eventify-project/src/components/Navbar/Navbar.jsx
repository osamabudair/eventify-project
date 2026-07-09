import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="navbar animate-fade-in-down">
      <h1 className="logo">Event<span>ify</span></h1>
      <div className="nav-actions">
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="login-btn" onClick={() => navigate('/auth')}>Log In</button>
        <button className="register-btn" onClick={() => navigate('/auth')}>Registration</button>
      </div>
    </nav>
  );
};

export default Navbar;