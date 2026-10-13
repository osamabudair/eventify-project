import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './ToastNotification.css';

const ToastNotification = ({ toast, onClose }) => {
  if (!toast?.show) return null;

  return (
    <div className={`toast-notification ${toast.type}`}>
      <div className="toast-icon">
        {toast.type === 'success' && <CheckCircle2 size={18} />}
        {toast.type === 'error' && <AlertCircle size={18} />}
        {toast.type === 'info' && <Info size={18} />}
      </div>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        <X size={14} />
      </button>
    </div>
  );
};

export default ToastNotification;

