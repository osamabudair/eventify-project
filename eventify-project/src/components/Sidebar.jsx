import React from 'react';
import { LayoutDashboard, CalendarDays, Users, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo">Event<span>ify</span></h1>
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={18} /> Overview
        </button>
        <button 
          className={`nav-item ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          <CalendarDays size={18} /> Manage Events
        </button>
        <button 
          className={`nav-item ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          <Users size={18} /> Registrations
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} /> Profile
        </button>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;