// --- Imports ---
import React from 'react';
import { LayoutDashboard, Ticket, User, LogOut } from 'lucide-react';

const StudentSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  // --- Main Render ---
  return (
    <aside className="sidebar">
      
      {/* Sidebar Header / Logo */}
      <div className="sidebar-header">
        <h1 className="logo">
          Event<span>ify</span>
        </h1>
      </div>
      
      {/* Navigation Links */}
      <nav className="sidebar-nav">
        
        <button 
          className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={18} /> Overview
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <Ticket size={18} /> My Tickets
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} /> Profile
        </button>
        
      </nav>
      
      {/* Sidebar Footer / Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
      
    </aside>
  );
};

export default StudentSidebar;