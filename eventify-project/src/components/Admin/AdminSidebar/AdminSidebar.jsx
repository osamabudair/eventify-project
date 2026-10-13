import React from 'react';
import {
  Shield,
  Clock,
  Users,
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  stats,
  leadersCount = 0,
  pendingCount = 0,
  studentsCount = 0,
  currentUser = {},
  onLogout,
}) => {
  return (
    <aside className="sidebar admin-sidebar">
      <div className="sidebar-header">
        <h1 className="logo">
          Event<span>ify</span>
        </h1>
        <span className="admin-badge">ADMIN CONSOLE</span>
      </div>

      {/* Sidebar Navigation */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <LayoutDashboard size={18} />
          <span>Overview & Stats</span>
          <span className="sidebar-nav-counter">{stats.totalUsersCount}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'all-leaders' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-leaders')}
        >
          <Users size={18} />
          <span>All Club Leaders</span>
          <span className="sidebar-nav-counter">{leadersCount}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <GraduationCap size={18} />
          <span>Registered Students</span>
          <span className="sidebar-nav-counter">{studentsCount}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <Clock size={18} />
          <span>Pending Approval</span>
          <span
            className={`sidebar-nav-counter ${pendingCount > 0 ? 'pending-active' : ''}`}
          >
            {pendingCount}
          </span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="admin-user-info">
          <div className="admin-avatar">
            <Shield size={18} />
          </div>
          <div className="admin-user-details">
            <span className="admin-user-name">
              {currentUser.name || 'System Admin'}
            </span>
            <span className="admin-user-email">
              {currentUser.email || 'admin@eventify.com'}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

