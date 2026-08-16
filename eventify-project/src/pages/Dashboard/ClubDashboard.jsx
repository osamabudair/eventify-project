// --- Imports ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Plus } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import CreateEventModal from '../../components/createEventModel/CreateEventModal';
import OverviewTab from './tabs/OverviewTab';
import ManageEventsTab from './tabs/ManageEventsTab';
import RegistrationsTab from './tabs/RegistrationsTab';
import ProfileTab from '../StudentDashboard/tabs/ProfileTab'; 
import './ClubDashboard.css'; // تم تغيير اسم الاستدعاء

const ClubDashboard = () => {
  // --- Hooks & State ---
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('Club Leader');

  // --- Side Effects ---
  useEffect(() => { 
    document.title = "Club Dashboard - Eventify"; 

    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserName(user.username || 'Club Leader');
    }
  }, []);

  // --- Handlers ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // --- Tab Rendering Logic ---
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': 
        return <OverviewTab setActiveTab={setActiveTab} />;
      case 'manage': 
        return <ManageEventsTab />;
      case 'registrations': 
        return <RegistrationsTab />;
      case 'settings': 
        return <ProfileTab />;
      default: 
        return null;
    }
  };

  // --- Main Render ---
  return (
    <div className="dashboard-layout">
      
      {/* --- Sidebar --- */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      {/* --- Main Content Area --- */}
      <main className="main-content">
        
        {/* --- Header --- */}
        <header className="dashboard-header">
          <div>
            <h2>Welcome back, {userName}</h2>
            <p className="text-secondary">Here is what's happening with your events today.</p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="primary-btn add-event-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Create Event
            </button>
          </div>
        </header>

        {/* --- Active Tab Content --- */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      {/* --- Modals --- */}
      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default ClubDashboard;