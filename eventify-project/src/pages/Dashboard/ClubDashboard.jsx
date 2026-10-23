// --- Imports ---
import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Plus } from 'lucide-react';
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
  const [userAvatar, setUserAvatar] = useState(null);

  const { toast } = useToast();

  const showToast = (message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else if (type === 'info') toast.info(message);
    else toast.success(message);
  };

  useEffect(() => {
    document.title = 'Club Dashboard - Eventify';

    const syncUser = () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserName(user.username || user.name || 'Club Leader');
        const resolvedAvatar =
          user.avatarUrl ||
          user.profileImageUrl ||
          user.avatar ||
          user.profilePicture ||
          localStorage.getItem(`avatar_${user.id || user._id || user.email}`) ||
          null;
        setUserAvatar(resolvedAvatar);
      }
    };

    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
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

  const initials = userName ? userName.substring(0, 2).toUpperCase() : 'CL';

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
            <p className="text-secondary">
              Here is what's happening with your events today.
            </p>
          </div>
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              type="button"
              className="header-avatar-btn"
              onClick={() => setActiveTab('settings')}
              title="Profile Settings"
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="header-avatar-img" />
              ) : (
                <span className="header-avatar-monogram">{initials}</span>
              )}
            </button>
            <button
              className="primary-btn add-event-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} /> Create Event
            </button>
          </div>
        </header>

        <div className="animate-fade-in">{renderContent()}</div>
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
