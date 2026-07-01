import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Dashboard.css';

const Dashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // بيانات وهمية للإحصائيات والجداول
  const stats = [
    { title: 'Total Events', value: '12', icon: '📅' },
    { title: 'Total Registrations', value: '348', icon: '👥' },
    { title: 'Pending Requests', value: '25', icon: '⏳' },
  ];

  const recentEvents = [
    { id: 1, name: 'AI Fundamentals Workshop', date: 'July 15, 2026', status: 'Active' },
    { id: 2, name: 'Web Dev Bootcamp', date: 'July 22, 2026', status: 'Draft' },
    { id: 3, name: 'Cybersecurity Panel', date: 'August 05, 2026', status: 'Active' },
  ];

  const handleLogout = () => {
    // لاحقاً سيتم مسح التوكن (Token) من هنا
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* الشريط الجانبي (Sidebar) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="logo">Event<span>ify</span></h1>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">📊 Overview</button>
          <button className="nav-item">📅 Manage Events</button>
          <button className="nav-item">👥 Registrations</button>
          <button className="nav-item">⚙️ Settings</button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* مساحة العمل الرئيسية */}
      <main className="main-content">
        {/* الشريط العلوي (Top Header) */}
        <header className="dashboard-header">
          <div>
            <h2>Welcome back, Club Leader! 👋</h2>
            <p className="text-secondary">Here is what's happening with your events today.</p>
          </div>
          <div className="header-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="primary-btn add-event-btn">+ Create Event</button>
          </div>
        </header>

        {/* البطاقات الإحصائية (Stats Cards) */}
        <div className="stats-grid animate-slide-up">
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

        {/* جدول الفعاليات (Recent Events Table) */}
        <div className="table-container animate-slide-up-delayed">
          <div className="table-header">
            <h3>Recent Events</h3>
            <button className="view-all-btn">View All</button>
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
                    <button className="action-btn edit">✏️ Edit</button>
                    <button className="action-btn delete">🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;