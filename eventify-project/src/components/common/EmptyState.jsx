import React from 'react';
import './EmptyState.css';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  compact = false,
  className = ''
}) {
  const buttonText = actionText || actionLabel;

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null)) {
      const IconComponent = Icon;
      return <IconComponent size={compact ? 24 : 32} />;
    }
    return Icon;
  };

  return (
    <div className={`empty-state-card empty-state-container ${compact ? 'compact' : ''} ${className}`.trim()}>
      {Icon && (
        <div className="empty-state-icon-box empty-state-icon-wrapper">
          {renderIcon()}
        </div>
      )}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {buttonText && onAction && (
        <button
          type="button"
          className="empty-state-action-btn"
          onClick={onAction}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
