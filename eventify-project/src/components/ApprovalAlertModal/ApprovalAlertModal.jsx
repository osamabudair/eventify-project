import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, Clock, CheckCircle2, X } from 'lucide-react';
import './ApprovalAlertModal.css';

const ApprovalAlertModal = ({ 
  isOpen, 
  onClose, 
  primaryMessage = "Please wait until your registration is approved and verified", 
  secondaryMessage = "Please wait until you are approved by the admin",
  leaderName = ""
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="approval-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="approval-modal-box" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="approval-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Glowing Icon Header */}
        <div className="approval-icon-wrapper">
          <div className="approval-pulse-ring"></div>
          <div className="approval-icon-badge">
            <ShieldAlert size={32} className="approval-main-icon" strokeWidth={2.2} />
          </div>
        </div>

        {/* Modal Header */}
        <div className="approval-badge-wrapper">
          <span className="approval-role-pill">
            <Clock size={13} /> Club Leader Account • Pending Review
          </span>
        </div>

        <div className="approval-modal-header">
          {leaderName && <h4 className="approval-leader-name">Welcome, {leaderName}</h4>}
          <h2 className="approval-primary-msg">{primaryMessage}</h2>
          <p className="approval-secondary-msg">{secondaryMessage}</p>
        </div>

        {/* Info Box */}
        <div className="approval-info-card">
          <div className="approval-info-step">
            <span className="step-icon done"><CheckCircle2 size={15} /></span>
            <div className="step-text">
              <strong>Account details submitted</strong>
              <span>Your registration request has been submitted and recorded in the system</span>
            </div>
          </div>
          <div className="approval-info-step">
            <span className="step-icon pending"><Clock size={15} /></span>
            <div className="step-text">
              <strong>Admin review & verification</strong>
              <span>The administrator is currently reviewing and verifying your leader application</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="approval-modal-footer">
          <button className="approval-confirm-btn" onClick={onClose}>
            Got it, I'll wait for approval
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ApprovalAlertModal;
