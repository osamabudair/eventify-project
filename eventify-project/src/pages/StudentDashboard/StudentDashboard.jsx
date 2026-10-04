// داخل StudentDashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, CheckCircle2, AlertCircle, Info, X, Calendar, Clock, CheckCheck } from 'lucide-react';
import StudentSidebar from '../../components/StudentSidebar';
import StudentOverviewTab from './tabs/StudentOverviewTab';
import MyTicketsTab from './tabs/MyTicketsTab';
import ProfileTab from './tabs/ProfileTab';
import { getMyRegistrationsApi } from '../../api/axiosInstance';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userName, setUserName] = useState('Student');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Smart Notifications مع حفظ المقروء في localStorage
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchEventAlerts = async () => {
      try {
        const res = await getMyRegistrationsApi();
        const approvedTickets = (res.data || []).filter(r => r.status === 'approved' && r.event);
        
        // جلب قائمة المعرفات المقروءة مسبقاً
        const readIds = JSON.parse(localStorage.getItem('read_notifications') || '[]');
        const todayStr = new Date().toISOString().split('T')[0];

        const alerts = [];
        approvedTickets.forEach(ticket => {
          const ticketId = String(ticket._id || ticket.id);
          const evDate = ticket.event.date;
          
          // إذا كانت الفعالية اليوم ولم تكن مقروءة مسبقاً
          if (evDate && evDate.startsWith(todayStr) && !readIds.includes(ticketId)) {
            alerts.push({
              id: ticketId,
              title: ticket.event.title || ticket.event.name,
              time: ticket.event.time || ticket.event.startTime || 'Today',
              text: `Happening today! Check your ticket.`
            });
          }
        });
        setNotifications(alerts);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchEventAlerts();
  }, []);

  const handleMarkAllAsRead = () => {
    const currentIds = notifications.map(n => n.id);
    const existingRead = JSON.parse(localStorage.getItem('read_notifications') || '[]');
    const updated = Array.from(new Set([...existingRead, ...currentIds]));
    
    localStorage.setItem('read_notifications', JSON.stringify(updated));
    setNotifications([]);
    if (showToast) showToast("All notifications marked as read", "info");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { 
    document.title = "Student Portal - Eventify"; 
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      setUserName(user.username || user.name || 'Student');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const memoizedContent = useMemo(() => {
    switch (activeTab) {
      case 'overview': 
        return <StudentOverviewTab setActiveTab={setActiveTab} showToast={showToast} />;
      case 'tickets': 
        return <MyTicketsTab showToast={showToast} />;
      case 'profile': 
        return <ProfileTab showToast={showToast} />;
      default: 
        return <StudentOverviewTab setActiveTab={setActiveTab} showToast={showToast} />;
    }
  }, [activeTab]);

  return (
    <div className="dashboard-layout">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(prev => ({ ...prev, show: false }))}>
            <X size={14} />
          </button>
        </div>
      )}

      <StudentSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h2>Hello, {userName}</h2>
            <p className="text-secondary">Ready to explore new campus activities?</p>
          </div>
          
          <div className="header-actions">
            {/* Notification Bell */}
            <div className="notif-wrapper" ref={notifRef}>
              <button 
                className="theme-toggle notif-btn" 
                onClick={() => setShowNotifications(prev => !prev)}
                title="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
              </button>

              {showNotifications && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <h4>Notifications</h4>
                    {notifications.length > 0 ? (
                      <button className="btn-mark-read" onClick={handleMarkAllAsRead}>
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>0 New</span>
                    )}
                  </div>
                  <div className="notif-dropdown-body">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">All caught up! No new notifications.</p>
                    ) : (
                      notifications.map(item => (
                        <div 
                          key={item.id} 
                          className="notif-item" 
                          onClick={() => { setActiveTab('tickets'); setShowNotifications(false); }}
                        >
                          <Calendar size={18} className="notif-item-icon" />
                          <div className="notif-item-text">
                            <strong>{item.title}</strong>
                            <p>{item.text}</p>
                            <span className="notif-time"><Clock size={12} /> {item.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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