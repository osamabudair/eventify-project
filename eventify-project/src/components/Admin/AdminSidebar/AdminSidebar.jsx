import React, { useState, useEffect } from 'react';
import {
  Shield,
  Clock,
  Users,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  stats,
  leadersCount = 0,
  pendingCount = 0,
  studentsCount = 0,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      <div className="mobile-top-bar">
        <button
          className="mobile-menu-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
        <div className="mobile-bar-brand">
          <h1 className="logo">
            Event<span>ify</span>
          </h1>
          <span className="admin-badge">ADMIN</span>
        </div>
        <div className="mobile-bar-spacer" />
      </div>

      <div
        className={`sidebar-drawer-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      <aside className={`sidebar admin-sidebar ${isOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-header">
          <div>
            <h1 className="logo">
              Event<span>ify</span>
            </h1>
            <span className="admin-badge">ADMIN CONSOLE</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => handleNavClick('stats')}
          >
            <LayoutDashboard size={18} />
            <span>Overview & Stats</span>
            <span className="sidebar-nav-counter">{stats.totalUsersCount}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'all-leaders' ? 'active' : ''}`}
            onClick={() => handleNavClick('all-leaders')}
          >
            <Users size={18} />
            <span>All Club Leaders</span>
            <span className="sidebar-nav-counter">{leadersCount}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => handleNavClick('students')}
          >
            <GraduationCap size={18} />
            <span>Registered Students</span>
            <span className="sidebar-nav-counter">{studentsCount}</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => handleNavClick('approvals')}
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

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogoutClick}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

