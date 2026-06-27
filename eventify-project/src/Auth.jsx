import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  
  // حالة التحكم بالأنيميشن
  const [animationClass, setAnimationClass] = useState('fade-in');
  const navigate = useNavigate();

  // دالة تبديل الصفحة مع تأثير حركي
  const toggleAuthMode = () => {
    setAnimationClass('fade-out'); // بدء الاختفاء
    setTimeout(() => {
      setIsLogin(!isLogin);
      setPassword('');
      setConfirmPassword('');
      setAnimationClass('fade-in'); // بدء الظهور
    }, 300); // 300 ملي ثانية (نفس مدة الـ CSS)
  };

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);
  const getStrengthData = () => {
    switch(strength) {
      case 1: return { label: 'Weak', color: '#ef4444', width: '25%' };
      case 2: return { label: 'Fair', color: '#f59e0b', width: '50%' };
      case 3: return { label: 'Good', color: '#3b82f6', width: '75%' };
      case 4: return { label: 'Strong', color: '#10b981', width: '100%' };
      default: return { label: '', color: '#e5e7eb', width: '0%' };
    }
  };
  const strengthData = getStrengthData();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Form Submitted - Role:", role);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        <button className="back-btn" onClick={() => navigate('/')}>
          &larr; Back to Home
        </button>
        
        <div className="auth-header">
          <h1 className="logo">Event<span>ify</span></h1>
          <h2>{isLogin ? 'Welcome Back!' : 'Create an Account'}</h2>
          <p>{isLogin ? 'Please enter your details to sign in.' : 'Join us and start managing or joining events.'}</p>
        </div>

        {/* غلاف الأنيميشن */}
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
              {/* تعديل الـ placeholder لإيميل طبيعي */}
              <input type="email" placeholder="example@gmail.com" required />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {!isLogin && (
              <div className="password-strength-container">
                <div className="strength-bar-bg">
                  <div 
                    className="strength-bar-fill" 
                    style={{ width: strengthData.width, backgroundColor: strengthData.color }}
                  ></div>
                </div>
                <div className="strength-text">
                  <span style={{ color: strengthData.color, fontWeight: 'bold' }}>{strengthData.label}</span>
                </div>
              </div>
            )}

            {/* حقل تأكيد كلمة المرور */}
            {!isLogin && (
              <div className="input-group">
                <label>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            {/* التصميم الموديرن لاختيار نوع الحساب */}
            {!isLogin && (
              <div className="role-selection">
                <label>I am a:</label>
                <div className="role-options">
                  <div 
                    className={`role-box ${role === 'STUDENT' ? 'active' : ''}`}
                    onClick={() => setRole('STUDENT')}
                  >
                    <span className="role-icon">🎓</span>
                    <span>Student</span>
                  </div>
                  <div 
                    className={`role-box ${role === 'CLUB_LEADER' ? 'active' : ''}`}
                    onClick={() => setRole('CLUB_LEADER')}
                  >
                    <span className="role-icon">👑</span>
                    <span>Club Leader</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleAuthMode} className="toggle-btn">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default Auth;