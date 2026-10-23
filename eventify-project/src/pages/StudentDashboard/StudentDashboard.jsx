// --- Student Dashboard Component ---
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Sun, Moon, Bell, Calendar, Clock, CheckCheck } from 'lucide-react';
import StudentSidebar from '../../components/StudentSidebar';
import StudentOverviewTab from './tabs/StudentOverviewTab';
import MyTicketsTab from './tabs/MyTicketsTab';
import ProfileTab from './tabs/ProfileTab';
import {
  getMyRegistrationsApi,
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../../api/axiosInstance';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userName, setUserName] = useState('Student');
  const [userAvatar, setUserAvatar] = useState(null);

  const { toast } = useToast();

  const showToast = (message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else if (type === 'info') toast.info(message);
    else toast.success(message);
  };

  // Notifications state (Backend + Today's Event Alerts)
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNotificationsAndAlerts = async () => {
      const combined = [];

      // 1. Fetch persisted backend notifications
      try {
        const apiNotifs = await getNotificationsApi();
        if (Array.isArray(apiNotifs)) {
          apiNotifs.forEach((n) => {
            if (!n.read && !n.isRead) {
              combined.push({
                id: `api_${n.id}`,
                backendId: n.id,
                title: n.title || 'Notification',
                time: n.createdAt
                  ? new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent',
                text: n.message || '',
              });
            }
          });
        }
      } catch {
        // Proceed with local event alerts if backend notifications endpoint is unreachable
      }

      // 2. Also include local alerts for today's approved events
      try {
        const res = await getMyRegistrationsApi();
        const approvedTickets = (res.data || []).filter(
          (r) => r.status === 'approved' && r.event
        );

        const readIds = JSON.parse(
          localStorage.getItem('read_notifications') || '[]'
        );
        const todayStr = new Date().toISOString().split('T')[0];

        approvedTickets.forEach((ticket) => {
          const ticketId = String(ticket._id || ticket.id);
          const evDate = ticket.event.date;

          if (evDate && evDate.startsWith(todayStr) && !readIds.includes(ticketId)) {
            combined.push({
              id: ticketId,
              title: ticket.event.title || ticket.event.name,
              time: ticket.event.time || ticket.event.startTime || 'Today',
              text: 'Happening today! Check your ticket.',
            });
          }
        });
      } catch {
        // Ignore error
      }

      if (isMounted) {
        setNotifications(combined);
      }
    };

    fetchNotificationsAndAlerts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleNotificationClick = async (item) => {
    if (item.backendId) {
      try {
        await markNotificationReadApi(item.backendId);
      } catch {
        // Ignore error
      }
    } else {
      const existingRead = JSON.parse(
        localStorage.getItem('read_notifications') || '[]'
      );
      const updated = Array.from(new Set([...existingRead, item.id]));
      localStorage.setItem('read_notifications', JSON.stringify(updated));
    }
    setNotifications((prev) => prev.filter((n) => n.id !== item.id));
    setActiveTab('tickets');
    setShowNotifications(false);
  };

  const handleMarkAllAsRead = async () => {
    const currentIds = notifications.map((n) => n.id);
    const existingRead = JSON.parse(
      localStorage.getItem('read_notifications') || '[]'
    );
    const updated = Array.from(new Set([...existingRead, ...currentIds]));

    localStorage.setItem('read_notifications', JSON.stringify(updated));
    setNotifications([]);

    try {
      await markAllNotificationsReadApi();
    } catch {
      // Ignore error
    }

    if (showToast) showToast('All notifications marked as read', 'info');
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
    document.title = 'Student Portal - Eventify';

    const syncUser = () => {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        setUserName(user.username || user.name || 'Student');
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

  const initials = userName ? userName.substring(0, 2).toUpperCase() : 'ST';

  return (
    <div className="dashboard-layout">
      <StudentSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h2>Hello, {userName}</h2>
            <p className="text-secondary">
              Ready to explore upcoming events and workshops?
            </p>
          </div>

          <div className="header-actions">
            {/* Notification Bell */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="theme-toggle notif-btn header-plain-btn"
                onClick={() => setShowNotifications((prev) => !prev)}
                title="Notifications"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length}</span>
                )}
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
                      <span className="notif-empty-badge">0 New</span>
                    )}
                  </div>
                  <div className="notif-dropdown-body">
                    {notifications.length === 0 ? (
                      <p className="notif-empty">
                        All caught up! No new notifications.
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className="notif-item"
                          onClick={() => handleNotificationClick(item)}
                        >
                          <Calendar size={18} className="notif-item-icon" />
                          <div className="notif-item-text">
                            <strong>{item.title}</strong>
                            <p>{item.text}</p>
                            <span className="notif-time">
                              <Clock size={12} /> {item.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button className="theme-toggle header-plain-btn" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              type="button"
              className="header-avatar-btn"
              onClick={() => setActiveTab('profile')}
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
              onClick={() => navigate('/explore')}
            >
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
