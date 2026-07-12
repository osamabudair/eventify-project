import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Plus } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import CreateEventModal from '../../components/CreateEventModal';
import OverviewTab from './tabs/OverviewTab';
import ManageEventsTab from './tabs/ManageEventsTab';
import RegistrationsTab from './tabs/RegistrationsTab';
import SettingsTab from './tabs/SettingsTab';
import './Dashboard.css';

const Dashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { document.title = "Dashboard - Eventify"; }, []);

  const handleLogout = () => navigate('/');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': 
        return <OverviewTab setActiveTab={setActiveTab} />;
      case 'manage': 
        return <ManageEventsTab />;
      case 'registrations': 
        return <RegistrationsTab />;
      case 'settings': 
        return <SettingsTab />;
      default: 
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h2>Welcome back, Club Leader</h2>
            <p className="text-secondary">Here is what's happening with your events today.</p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="primary-btn add-event-btn" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Create Event
            </button>
          </div>
        </header>

        {renderContent()}
      </main>

      <CreateEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;