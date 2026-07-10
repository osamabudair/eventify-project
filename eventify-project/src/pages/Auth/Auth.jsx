import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import AuthVisuals from '../../components/AuthVisuals';
import './Auth.css';

const Auth = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [animationClass, setAnimationClass] = useState('fade-in');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = isLogin ? "Log In - Eventify" : "Registration - Eventify";
  }, [isLogin]);

  const toggleAuthMode = () => {
    setAnimationClass('fade-out');
    setTimeout(() => {
      setIsLogin(!isLogin);
      setAnimationClass('fade-in');
    }, 300);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="back-btn" onClick={() => navigate('/')} style={{ marginBottom: 0 }}>
            &larr; Back to Home
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <div className="auth-header">
          <h1 className="logo">Event<span>ify</span></h1>
          <h2>{isLogin ? 'Welcome Back!' : 'Create an Account'}</h2>
          <p>{isLogin ? 'Please enter your details to sign in.' : 'Join us and start managing or joining events.'}</p>
        </div>

        {/*LoginForm - RegistrationForm*/}
        <div className={`auth-form-wrapper ${animationClass}`}>
          {isLogin ? <LoginForm /> : <RegistrationForm />}
        </div>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleAuthMode} className="toggle-btn">
              {isLogin ? 'Registration' : 'Log In'}
            </button>
          </p>
        </div>
        
      </div>
      
      {/*<AuthVisuals /> */}
    </div>
  );
};

export default Auth;