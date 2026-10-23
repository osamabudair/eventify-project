// --- Imports ---
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, CheckCheck, Clock } from 'lucide-react';
import {
  getNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../../api/axiosInstance';
import './Navbar.css';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifRef = useRef(null);

  const syncUserFromStorage = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const parsed = JSON.parse(userStr);
        const fallbackAvatar = localStorage.getItem(
          `avatar_${parsed.id || parsed._id || parsed.email}`
        );
        setCurrentUser({
          ...parsed,
          resolvedAvatar:
            parsed.avatarUrl ||
            parsed.profileImageUrl ||
            parsed.avatar ||
            parsed.profilePicture ||
            fallbackAvatar ||
            null,
        });
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncUserFromStorage();
    window.addEventListener('storage', syncUserFromStorage);
    return () => window.removeEventListener('storage', syncUserFromStorage);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadNotifications = async () => {
      try {
        const data = await getNotificationsApi();
        if (isMounted && Array.isArray(data)) {
          setNotifications(data);
        }
      } catch {
        // Ignore if endpoint is unavailable or user is unauthenticated
      }
    };

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  const handleMarkOneRead = async (notif) => {
    if (notif.read || notif.isRead) return;
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true, isRead: true } : n))
    );
    try {
      await markNotificationReadApi(notif.id);
    } catch {
      // Optimistic UI maintained
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, isRead: true }))
    );
    try {
      await markAllNotificationsReadApi();
    } catch {
      // Optimistic UI maintained
    }
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/auth';
    const role = (currentUser.role || '').toUpperCase();
    if (role.includes('ADMIN')) return '/admin-dashboard';
    if (role.includes('LEADER')) return '/club-dashboard';
    return '/student-dashboard';
  };

  const displayName = currentUser?.name || currentUser?.username || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <nav className="navbar animate-fade-in-down">
      {/* Brand Logo */}
      <h1 className="logo" onClick={() => navigate('/')}>
        Event<span>ify</span>
      </h1>

      {/* Navigation Actions */}
      <div className="nav-actions">
        {/* Theme Toggle Button */}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {currentUser ? (
          <>
            {/* Notification Bell Popover */}
            <div className="nav-notif-wrapper" ref={notifRef}>
              <button
                type="button"
                className="theme-toggle nav-notif-btn"
                onClick={() => setShowNotifDropdown((prev) => !prev)}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="nav-notif-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="nav-notif-popover">
                  <div className="nav-notif-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        className="nav-notif-mark-all"
                        onClick={handleMarkAllRead}
                      >
                        <CheckCheck size={14} /> Mark all as read
                      </button>
                    ) : (
                      <span className="nav-notif-count-label">All read</span>
                    )}
                  </div>

                  <div className="nav-notif-list">
                    {notifications.length === 0 ? (
                      <p className="nav-notif-empty">No notifications yet.</p>
                    ) : (
                      notifications.map((item) => {
                        const isUnread = !item.read && !item.isRead;
                        return (
                          <div
                            key={item.id}
                            className={`nav-notif-item ${isUnread ? 'unread' : ''}`}
                            onClick={() => handleMarkOneRead(item)}
                          >
                            <div className="nav-notif-item-top">
                              <strong>{item.title}</strong>
                              {isUnread && <span className="nav-notif-dot" />}
                            </div>
                            <p>{item.message}</p>
                            {item.createdAt && (
                              <span className="nav-notif-time">
                                <Clock size={11} />{' '}
                                {new Date(item.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill / Dashboard Shortcut */}
            <button
              type="button"
              className="nav-user-pill"
              onClick={() => navigate(getDashboardPath())}
              title="Go to Dashboard"
            >
              {currentUser.resolvedAvatar ? (
                <img
                  src={currentUser.resolvedAvatar}
                  alt={displayName}
                  className="nav-user-avatar-img"
                />
              ) : (
                <span className="nav-user-avatar-monogram">{initials}</span>
              )}
              <span className="nav-user-name">{displayName}</span>
            </button>
          </>
        ) : (
          <>
            <button className="login-btn" onClick={() => navigate('/auth')}>
              Sign In
            </button>
            <button className="register-btn" onClick={() => navigate('/auth')}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
