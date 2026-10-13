import React from 'react';
import {
  Bell,
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';
import './AdminHeader.css';

const AdminHeader = ({
  title = 'Leader Approval Management',
  subtitle = 'Review and verify club leader registration requests to authorize dashboard access.',
  pendingLeaders = [],
  isBellOpen = false,
  setIsBellOpen,
  bellRef,
  isDarkMode = false,
  toggleTheme,
  onApprove,
  onReject,
  actionLoadingId = null,
  onViewAllPending,
  getRelativeTime = () => 'Recently',
}) => {
  return (
    <header className="dashboard-header admin-header">
      <div>
        <h2>{title}</h2>
        <p className="text-secondary">{subtitle}</p>
      </div>

      <div className="header-actions">
        {/* Notification Bell (Borderless with modern top-right red notification dot) */}
        <div className="notification-bell-container" ref={bellRef}>
          <button
            className={`theme-toggle bell-btn ${isBellOpen ? 'active' : ''}`}
            onClick={() => setIsBellOpen(!isBellOpen)}
            aria-label="Notifications"
            title={
              pendingLeaders.length > 0
                ? `${pendingLeaders.length} Pending Approval Notifications`
                : 'Notifications'
            }
          >
            <Bell size={20} />
            {pendingLeaders.length > 0 && <span className="bell-badge-dot" />}
          </button>

          {/* Notification Dropdown */}
          {isBellOpen && (
            <div className="notifications-dropdown">
              <div className="notifications-dropdown-header">
                <div className="dropdown-title-group">
                  <span className="dropdown-title">Pending Approvals</span>
                  <span className="dropdown-counter">
                    {pendingLeaders.length} waiting
                  </span>
                </div>
                {pendingLeaders.length > 0 && (
                  <span className="dropdown-status-tag">Action Required</span>
                )}
              </div>

              <div className="notifications-list">
                {pendingLeaders.length === 0 ? (
                  <div className="empty-notifications">
                    <CheckCircle2 size={32} className="empty-icon" />
                    <p className="empty-title">All Caught Up!</p>
                    <p className="empty-sub">
                      No pending leader registrations at this time.
                    </p>
                  </div>
                ) : (
                  pendingLeaders.map((leader) => (
                    <div key={leader.id} className="notification-item">
                      <div className="notification-item-avatar">
                        {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                      </div>
                      <div className="notification-item-info">
                        <span className="notification-item-name">{leader.name}</span>
                        <span className="notification-item-email">
                          {leader.email}
                        </span>
                        <span className="notification-item-time">
                          <Clock size={12} /> {getRelativeTime(leader.createdAt)}
                        </span>
                      </div>
                      <div className="notification-item-actions">
                        <button
                          className="quick-action-btn accept"
                          onClick={() => onApprove(leader.id, leader.name)}
                          disabled={actionLoadingId === leader.id}
                          title="Accept Leader"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          className="quick-action-btn reject"
                          onClick={() => {
                            onReject(leader.id, leader.name);
                            setIsBellOpen(false);
                          }}
                          disabled={actionLoadingId === leader.id}
                          title="Reject Leader"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pendingLeaders.length > 0 && (
                <div className="notifications-dropdown-footer">
                  <button
                    className="dropdown-view-all-btn"
                    onClick={() => {
                      if (onViewAllPending) onViewAllPending();
                      setIsBellOpen(false);
                    }}
                  >
                    Manage All in Table
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;

