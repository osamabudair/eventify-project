import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter';
import AuthVisuals from '../../components/AuthVisuals';
import './Auth.css';

const Auth = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [animationClass, setAnimationClass] = useState('fade-in');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = isLogin ? "Log In - Eventify" : "Registration - Eventify";
  }, [isLogin]);

  const toggleAuthMode = () => {
    setAnimationClass('fade-out');
    setTimeout(() => {
      setIsLogin(!isLogin);
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setAnimationClass('fade-in');
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    navigate('/dashboard');
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

        <div className={`auth-form-wrapper ${animationClass}`}>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <input type="email" placeholder="example@gmail.com" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* استدعاء مكون قوة كلمة المرور */}
            {!isLogin && <PasswordStrengthMeter password={password} />}

            {!isLogin && (
              <div className="input-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="role-selection">
                <label>I am a:</label>
                <div className="role-options">
                  <div className={`role-box ${role === 'STUDENT' ? 'active' : ''}`} onClick={() => setRole('STUDENT')}>
                    <span className="role-icon">🎓</span>
                    <span>Student</span>
                  </div>
                  <div className={`role-box ${role === 'CLUB_LEADER' ? 'active' : ''}`} onClick={() => setRole('CLUB_LEADER')}>
                    <span className="role-icon">👑</span>
                    <span>Club Leader</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? 'Log In' : 'Registration'}
            </button>
          </form>
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
      
      {/* استدعاء المكون البصري إذا كنت بتستخدم تصميم العمودين */}
      {/* <AuthVisuals /> */} 
    </div>
  );
};

export default Auth;