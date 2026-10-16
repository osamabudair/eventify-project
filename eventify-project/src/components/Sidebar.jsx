import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarDays, Users, Settings, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
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
    handleLogout();
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
        </div>
        <div className="mobile-bar-spacer" />
      </div>

      <div
        className={`sidebar-drawer-overlay ${isOpen ? 'show' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      <aside className={`sidebar ${isOpen ? 'drawer-open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo">
            Event<span>ify</span>
          </h1>
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
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleNavClick('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => handleNavClick('manage')}
          >
            <CalendarDays size={18} />
            <span>Manage Events</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => handleNavClick('registrations')}
          >
            <Users size={18} />
            <span>Registrations</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <Settings size={18} />
            <span>Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogoutClick}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;