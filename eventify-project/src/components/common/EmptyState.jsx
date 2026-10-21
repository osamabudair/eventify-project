import React from 'react';
import './EmptyState.css';

const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  compact = false,
  className = ''
}) => {
  return (
    <div className={`empty-state-card ${compact ? 'compact' : ''} ${className}`}>
      {icon && (
        <div className="empty-state-icon-box">
          {icon}
        </div>
      )}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {actionText && onAction && (
        <button
          type="button"
          className="empty-state-action-btn"
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

