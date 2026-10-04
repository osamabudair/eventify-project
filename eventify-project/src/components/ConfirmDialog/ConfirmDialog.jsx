import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className={`confirm-icon-circle ${isDanger ? 'danger' : 'primary'}`}>
            <AlertTriangle size={24} />
          </div>
          <button className="confirm-close-x" onClick={onCancel}><X size={18} /></button>
        </div>

        <div className="confirm-modal-content">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button className="btn-confirm-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn-confirm-main ${isDanger ? 'btn-danger' : 'btn-primary'}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;