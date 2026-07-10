import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {/*Full name*/}
      <div className="input-group">
        <label>Full Name</label>
        <input type="text" placeholder="Osama Budair" required />
      </div>

      {/*Email address*/}
      <div className="input-group">
        <label>Email Address</label>
        <input type="email" placeholder="example@gmail.com" required />
      </div>

      {/*Password*/}
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

      {/*PasswordStrengthMeter*/}
      <PasswordStrengthMeter password={password} />

      {/*Confirm Password*/}
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

      {/*Role Selection*/}
      <div className="role-selection">
        <label>I am a:</label>
        <div className="role-options">
          <div className={`role-box ${role === 'STUDENT' ? 'active' : ''}`} onClick={() => setRole('STUDENT')}>
            <span className="role-icon"><GraduationCap size={24} /></span>
            <span>Student</span>
          </div>
          <div className={`role-box ${role === 'CLUB_LEADER' ? 'active' : ''}`} onClick={() => setRole('CLUB_LEADER')}>
            <span className="role-icon"><Briefcase size={24} /></span>
            <span>Club Leader</span>
          </div>
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Registration
      </button>
    </form>
  );
};

export default RegistrationForm;