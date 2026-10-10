// --- Imports ---
import React, { useState } from 'react';
import { Eye, EyeOff, GraduationCap, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter/PasswordStrengthMeter';
import { registerApi } from '../../api/axiosInstance';
import SocialAuthButtons from '../../components/SocialAuth/SocialAuthButtons';
import ApprovalAlertModal from '../../components/ApprovalAlertModal/ApprovalAlertModal';
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

  // Approval Alert Modal for Club Leaders
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState({
    primary: 'Please wait until your registration is approved and verified',
    secondary: 'Please wait until you are approved by the admin'
  });
  const [approvalLeaderName, setApprovalLeaderName] = useState('');

  const navigate = useNavigate();

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await registerApi({
        username,
        email,
        password,
        confirmPassword,
        role
      });

      const data = response.data;

      // When a user who is a leader attempts to register, show custom approval modal
      if (role === 'CLUB_LEADER' || data?.pendingApproval) {
        setApprovalLeaderName(username);
        setApprovalMessage({
          primary: data?.detailedMessage || 'Please wait until your registration is approved and verified',
          secondary: data?.message || 'Please wait until you are approved by the admin'
        });
        setShowApprovalModal(true);
        // Clear sensitive inputs
        setPassword('');
        setConfirmPassword('');
        return;
      }

      // Students registration flow (seamless, no approval required)
      const token = data?.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data));
      }

      const userRole = data?.role || role;
      if (userRole === 'STUDENT') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form">
        
        <div className="auth-header">
          <h1 className="logo">Event<span>ify</span></h1>
          <h2>Create an Account</h2>
          <p>Join us and start managing or joining events.</p>
        </div>

        {errorMsg && <div style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', marginBottom: '8px' }}>{errorMsg}</div>}

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
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          {/* Circular Social Auth Buttons */}
          <SocialAuthButtons />
        </div>

      </form>

      {/* Styled Approval Alert Modal for Club Leaders */}
      <ApprovalAlertModal 
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        primaryMessage={approvalMessage.primary}
        secondaryMessage={approvalMessage.secondary}
        leaderName={approvalLeaderName}
      />
    </>
  );
};

export default RegistrationForm;