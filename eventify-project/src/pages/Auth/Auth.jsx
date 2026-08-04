import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import AuthVisuals from '../../components/AuthVisuals';
import './Auth.css';

const Auth = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = isLogin ? "Log In - Eventify" : "Registration - Eventify";
  }, [isLogin]);

  return (
    <div className="auth-page-wrapper">
      
      {/* حاوية جديدة بتجمع الأزرار والبطاقة عشان يظلوا مرتبين مع بعض بالنص */}
      <div className="auth-content-wrapper">
        
        {/* الأزرار العلوية (فوق البطاقة مباشرة) */}
        <div className="top-nav-buttons">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} /> Back to Home
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* الحاوية الرئيسية للأنيميشن (البطاقة) */}
        <div className={`auth-main-container ${isLogin ? '' : 'right-panel-active'}`}>
          
          <div className="form-container sign-up-container">
            <RegistrationForm />
          </div>

          <div className="form-container sign-in-container">
            <LoginForm />
          </div>

          <AuthVisuals isLogin={isLogin} toggleView={() => setIsLogin(!isLogin)} />
          
        </div>
        
      </div>
    </div>
  );
};

export default Auth;