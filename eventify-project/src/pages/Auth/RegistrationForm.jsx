// --- Imports ---
import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Briefcase } from 'lucide-react';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { registerApi } from '../../api/axiosInstance';
import './RegistrationForm.css';

const RegistrationForm = () => {
  // --- State Management ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setErrorMsg('');
    setLoading(true);

    try {
      await registerApi({
        username,
        email,
        password,
        role
      });

      alert("Account registered successfully! Please Log In.");
      window.location.reload(); 
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      
      <div className="auth-header">
        <h1 className="logo">Event<span>ify</span></h1>
        <h2>Create an Account</h2>
        <p>Join us and start managing or joining events.</p>
      </div>

      {errorMsg && <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</div>}

      <div className="form-scrollable-content">
        <div className="input-group">
          <label>Full Name</label>
          <input 
            type="text" 
            placeholder="Osama Budair" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="example@gmail.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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

        <div style={{ marginTop: '-8px', marginBottom: '8px' }}>
          <PasswordStrengthMeter password={password} />
        </div>

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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating Account...' : 'Registration'}
        </button>
      </div>

    </form>
  );
};

export default RegistrationForm;