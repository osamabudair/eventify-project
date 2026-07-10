import React from 'react';
import './PasswordStrengthMeter.css';

const PasswordStrengthMeter = ({ password }) => {
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

  if (!password) return null;

  return (
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
  );
};

export default PasswordStrengthMeter;