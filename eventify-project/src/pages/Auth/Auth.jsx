// --- Imports ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import AuthVisuals from '../../components/AuthVisuals';
import './Auth.css';

const Auth = () => {
  // --- State & Hooks ---
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // --- Side Effects ---
  useEffect(() => {
    document.title = isLogin ? "Sign In - Eventify" : "Sign Up - Eventify";
  }, [isLogin]);

  // --- Render ---
  return (
    <div className="auth-page-wrapper">
      
      {/* --- Main Content Wrapper --- */}
      <div className="auth-content-wrapper">
        
        {/* --- Top Navigation --- */}
        <div className="top-nav-buttons">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Back
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* --- Auth Card Container --- */}
        <div className={`auth-main-container ${isLogin ? '' : 'right-panel-active'}`}>
          <div className="form-container sign-up-container">
            <RegistrationForm onToggleMode={() => setIsLogin(true)} />
          </div>

          <div className="form-container sign-in-container">
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          </div>

          <AuthVisuals isLogin={isLogin} toggleView={() => setIsLogin(!isLogin)} />
        </div>
      </div>
    </div>
  );
};

export default Auth;