import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Ban, AlertCircle, HelpCircle, X } from 'lucide-react';
import './SuspendedAlertModal.css';

const SuspendedAlertModal = ({
  isOpen,
  onClose,
  primaryMessage = 'Account Currently Suspended',
  secondaryMessage = 'Your account access has been temporarily suspended by the system administrator.',
  studentName = '',
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
    <div
      className="suspended-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="suspended-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="suspended-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Ambient Glowing Status Icon */}
        <div className="suspended-icon-wrapper">
          <div className="suspended-pulse-ring"></div>
          <div className="suspended-icon-badge">
            <Ban size={32} className="suspended-main-icon" strokeWidth={2.2} />
          </div>
        </div>

        {/* Status Badge */}
        <div className="suspended-badge-wrapper">
          <span className="suspended-role-pill">
            <AlertCircle size={13} /> Account Suspended
          </span>
        </div>

        {/* Main Title & Subtitle */}
        <div className="suspended-modal-header">
          {studentName && (
            <h4 className="suspended-student-name">{studentName}</h4>
          )}
          <h2 className="suspended-primary-msg">{primaryMessage}</h2>
          <p className="suspended-secondary-msg">{secondaryMessage}</p>
        </div>

        {/* Structured Info Card */}
        <div className="suspended-info-card">
          <div className="suspended-info-step">
            <div className="suspended-step-icon danger">
              <Ban size={15} />
            </div>
            <div className="suspended-step-text">
              <strong>Platform Access Restricted</strong>
              <span>Sign in and event registrations have been disabled for this account.</span>
            </div>
          </div>
          <div className="suspended-info-step">
            <div className="suspended-step-icon help">
              <HelpCircle size={15} />
            </div>
            <div className="suspended-step-text">
              <strong>Need Assistance?</strong>
              <span>Please contact the platform administrator or support team to review your account status.</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="suspended-modal-footer">
          <button className="suspended-confirm-btn" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SuspendedAlertModal;
