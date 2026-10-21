// --- Imports ---
import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Plus, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import CreateEventModal from '../../components/createEventModel/CreateEventModal';
import OverviewTab from './tabs/OverviewTab';
import ManageEventsTab from './tabs/ManageEventsTab';
import RegistrationsTab from './tabs/RegistrationsTab';
import ProfileTab from '../StudentDashboard/tabs/ProfileTab'; 
import './ClubDashboard.css';

const ClubDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('Club Leader');

  const { toast } = useToast();

  const showToast = (message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else if (type === 'info') toast.info(message);
    else toast.success(message);
  };

  useEffect(() => { 
    document.title = "Club Dashboard - Eventify"; 

    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserName(user.username || user.name || 'Club Leader');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': 
        return <OverviewTab setActiveTab={setActiveTab} showToast={showToast} />;
      case 'manage': 
        return <ManageEventsTab showToast={showToast} />;
      case 'registrations': 
        return <RegistrationsTab showToast={showToast} />;
      case 'settings': 
        return <ProfileTab showToast={showToast} />;
      default: 
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      <main className="main-content">
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

        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        showToast={showToast}
        onEventCreated={() => {
          setActiveTab('manage');
        }}
      />
    </div>
  );
};

export default ClubDashboard;