import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
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

      <button type="submit" className="submit-btn">Log In</button>
    </form>
  );
};

export default LoginForm;