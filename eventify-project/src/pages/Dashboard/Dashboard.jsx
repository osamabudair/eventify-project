import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, Moon, LayoutDashboard, CalendarDays, Users, 
  Settings, LogOut, Plus, Edit, Trash2, Calendar, Clock 
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // تغيير العنوان
  useEffect(() => {
    document.title = "Dashboard - Eventify";
  }, []);

  // حالة التحكم بالتبويبات (التنقل الداخلي)
  const [activeTab, setActiveTab] = useState('overview');
  
  // حالة التحكم بالنافذة المنبثقة (Modal) لإنشاء فعالية
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleLogout = () => {
    navigate('/');
  };

  // تفاعلات أزرار التعديل والحذف
  const handleEdit = (eventName) => {
    alert(`Editing event: ${eventName}\n(This will open an edit form later)`);
  };

  const handleDelete = (eventName) => {
    if(window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      alert("Event deleted successfully!");
    }
  };

  // دالة لعرض المحتوى بناءً على التبويب النشط
  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="animate-fade-in">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-details">
                  <h3>{stat.value}</h3>
                  <p>{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="table-container">
            <div className="table-header">
              <h3>Recent Events</h3>
              <button className="view-all-btn" onClick={() => setActiveTab('manage')}>View All</button>
            </div>
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="font-semibold">{event.name}</td>
                    <td>{event.date}</td>
                    <td>
                      <span className={`status-badge ${event.status.toLowerCase()}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleEdit(event.name)}>
                        <Edit size={16} /> Edit
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(event.name)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (activeTab === 'manage') {
      return (
        <div className="animate-fade-in manage-events-view">
          <h3>Manage All Events</h3>
          <p className="text-secondary">Here you can see a detailed view of all your club's events.</p>
          {/* يمكن إضافة جدول أكبر أو شبكة بطاقات هنا لاحقاً */}
          <div className="placeholder-box">
             <CalendarDays size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
             <p>Full events list will be displayed here.</p>
          </div>
        </div>
      );
    }
    // يمكن إضافة باقي التبويبات هنا (Registrations, Settings)
    return <div className="animate-fade-in"><h3>Work in progress...</h3></div>;
  };

  return (
    <div className="dashboard-layout">
      {/* الشريط الجانبي */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Event<span>ify</span></h1>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <CalendarDays size={20} /> Manage Events
          </button>
          <button 
            className={`nav-item ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            <Users size={20} /> Registrations
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} /> Settings
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* مساحة العمل الرئيسية */}
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

        {/* عرض المحتوى المتغير بناءً على التبويب */}
        {renderContent()}

      </main>

      {/* النافذة المنبثقة (Modal) لإنشاء فعالية */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Event</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Event Name</label>
                <input type="text" placeholder="e.g. React Bootcamp" />
              </div>
              <div className="input-group" style={{ marginTop: '16px' }}>
                <label>Date</label>
                <input type="date" />
              </div>
              <button 
                className="primary-btn" 
                style={{ width: '100%', marginTop: '24px' }}
                onClick={() => { alert("Event Created!"); setIsModalOpen(false); }}
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;