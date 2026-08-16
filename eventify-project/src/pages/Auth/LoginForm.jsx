// --- Imports ---
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../../api/axiosInstance';

const LoginForm = () => {
  // --- State Management ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await loginApi({ email, password });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      const userRole = response.data.role;

      if (userRole === 'CLUB_LEADER') {
        navigate('/club-dashboard');
      } else if (userRole === 'ADMIN') {
        navigate('/admin-dashboard'); 
      } else {
        navigate('/student-dashboard');
      }
      
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <form onSubmit={handleSubmit} className="auth-form">
      
      <div className="auth-header">
        <h1 className="logo">Event<span>ify</span></h1>
        <h2>Welcome Back!</h2>
        <p>Please enter your details to sign in.</p>
      </div>

      {errorMsg && <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{errorMsg}</div>}

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

      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>

    </form>
  );
};

export default LoginForm;