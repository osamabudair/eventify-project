import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, CalendarDays, Calendar, Users, Clock, Edit, Trash2, Plus } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import CreateEventModal from '../../components/CreateEventModal';
import StatCard from '../../components/StatCard';
import RecentEventsTable from '../../components/RecentEventsTable';
import './Dashboard.css';

const Dashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Dashboard - Eventify";
  }, []);

  const stats = [
    { title: 'Total Events', value: '12', icon: <Calendar size={24} /> },
    { title: 'Total Registrations', value: '348', icon: <Users size={24} /> },
    { title: 'Pending Requests', value: '25', icon: <Clock size={24} /> },
  ];

  const recentEvents = [
    { id: 1, name: 'AI Fundamentals Workshop', date: 'July 15, 2026', status: 'Active' },
    { id: 2, name: 'Web Dev Bootcamp', date: 'July 22, 2026', status: 'Draft' },
    { id: 3, name: 'Cybersecurity Panel', date: 'August 05, 2026', status: 'Active' },
  ];

  const handleLogout = () => navigate('/');
  const handleEdit = (eventName) => alert(`Editing event: ${eventName}`);
  const handleDelete = (eventName) => {
    if(window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      alert("Event deleted successfully!");
    }
  };

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="animate-fade-in">
          {/* استدعاء البطاقات الإحصائية بنظافة */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
            ))}
          </div>

          {/* استدعاء الجدول بنظافة */}
          <RecentEventsTable 
            events={recentEvents} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
            onViewAll={() => setActiveTab('manage')} 
          />
        </div>
      );
    }
  }

  return (
    <div className="dashboard-layout">
      {/* استدعاء الشريط الجانبي كمكون مستقل */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h2>Welcome back, Club Leader! 👋</h2>
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

      {/* استدعاء النافذة المنبثقة كمكون مستقل */}
      <CreateEventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;