import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import StudentSidebar from '../../components/StudentSidebar';
import StudentOverviewTab from './tabs/StudentOverviewTab';
import MyTicketsTab from './tabs/MyTicketsTab';
import ProfileTab from './tabs/ProfileTab';
import './StudentDashboard.css'; 

const StudentDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userName, setUserName] = useState('Student');

  useEffect(() => { 
    document.title = "Student Portal - Eventify"; 
    
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserName(user.username || 'Student');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const memoizedContent = useMemo(() => {
    switch (activeTab) {
      case 'overview': return <StudentOverviewTab />;
      case 'tickets': return <MyTicketsTab />;
      case 'profile': return <ProfileTab />;
      default: return <StudentOverviewTab />;
    }
  }, [activeTab]);

  return (
    <div className="dashboard-layout">
      <StudentSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h2>Hello, {userName}</h2>
            <p className="text-secondary">Ready to explore new campus activities?</p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="primary-btn add-event-btn" onClick={() => navigate('/explore')}>
              Explore Events
            </button>
          </div>
        </header>

        {memoizedContent}
      </main>
    </div>
  );
};

export default StudentDashboard;