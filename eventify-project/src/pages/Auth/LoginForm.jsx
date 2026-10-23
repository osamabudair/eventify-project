// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginApi } from '../../api/axiosInstance';
import SocialAuthButtons from '../../components/SocialAuth/SocialAuthButtons';
import ApprovalAlertModal from '../../components/ApprovalAlertModal/ApprovalAlertModal';
import SuspendedAlertModal from '../../components/SuspendedAlertModal/SuspendedAlertModal';

const LoginForm = ({ onToggleMode }) => {
  // --- State Management ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Approval Modal for Club Leaders
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState({
    primary: 'Please wait until your registration is approved and verified',
    secondary: 'Please wait until you are approved by the admin'
  });

  // Suspended Modal for Blocked Students
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);
  const [suspendedMessage, setSuspendedMessage] = useState({
    primary: 'Account Currently Suspended',
    secondary: 'Your account has been suspended by the system administrator. You cannot log in at this time.'
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected with suspended state, trigger alert modal immediately
  useEffect(() => {
    if (location.state?.suspended) {
      setErrorMsg('Account Currently Suspended');
      setShowSuspendedModal(true);
    }
  }, [location.state]);

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const normalizedEmail = (email || '').trim().toLowerCase();

    try {
      const response = await loginApi({ email: normalizedEmail, password });
      
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
      // Check if user account is suspended (e.g. Student)
      const isSuspended = 
        err.response?.status === 403 && 
        (err.response?.data?.suspended || err.response?.data?.error === 'ACCOUNT_SUSPENDED');

      if (isSuspended) {
        setSuspendedMessage({
          primary: err.response?.data?.message || 'Account Currently Suspended',
          secondary: err.response?.data?.detailedMessage || 'Your account has been suspended by the system administrator. You cannot log in at this time.'
        });
        setErrorMsg(err.response?.data?.message || 'Account currently suspended');
        setShowSuspendedModal(true);
        return;
      }

      // Check if user is a club leader awaiting admin approval
      const isPendingApproval = 
        err.response?.status === 403 && 
        (err.response?.data?.pendingApproval || err.response?.data?.error === 'PENDING_APPROVAL');

      if (isPendingApproval) {
        setApprovalMessage({
          primary: err.response.data.message || 'Please wait until your registration is approved and verified',
          secondary: err.response.data.detailedMessage || 'Please wait until you are approved by the admin'
        });
        setShowApprovalModal(true);
      } else {
        setErrorMsg(
          err.response?.data?.message ||
          err.response?.data?.email ||
          err.response?.data?.password ||
          err.response?.data?.error ||
          'Failed to login'
        );
      }
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
          <h2>Welcome Back!</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        {errorMsg && <div className="auth-error-msg">{errorMsg}</div>}

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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <SocialAuthButtons />

        {onToggleMode && (
          <div className="mobile-auth-switch">
            Don't have an account?{' '}
            <button type="button" onClick={onToggleMode}>
              Sign Up
            </button>
          </div>
        )}
      </form>

      {/* Styled Approval Alert Modal for Club Leaders */}
      <ApprovalAlertModal 
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        primaryMessage={approvalMessage.primary}
        secondaryMessage={approvalMessage.secondary}
      />

      {/* Styled Suspended Alert Modal for Students */}
      <SuspendedAlertModal
        isOpen={showSuspendedModal}
        onClose={() => setShowSuspendedModal(false)}
        primaryMessage={suspendedMessage.primary}
        secondaryMessage={suspendedMessage.secondary}
      />
    </>
  );
};

export default LoginForm;