// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Users, CalendarCheck, Activity, MapPin, Trash2, Ticket, AlertTriangle } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { StatCardSkeleton } from '../../../components/common/Skeletons';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrationsApi, getAllEventsApi, cancelRegistrationApi, registerForEventApi } from '../../../api/axiosInstance';
import './StudentOverviewTab.css';

// --- Local Timezone Date & Time Helpers (Amman / Local Time) ---
const parseEventDate = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    const [y, m = 1, d = 1] = dateVal;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('T')[0].split('-');
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);
    }
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 0, 0, 0, 0);
    }
  }
  const dt = new Date(dateVal);
  if (isNaN(dt.getTime())) return null;
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
};

const parseEndDateTime = (baseDate, timeVal) => {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59, 999);
  if (!timeVal || timeVal === 'TBA') return d;

  if (Array.isArray(timeVal)) {
    const [h = 23, m = 59] = timeVal;
    d.setHours(Number(h), Number(m), 59, 999);
    return d;
  }

  if (typeof timeVal === 'string') {
    const isPM = /pm/i.test(timeVal);
    const isAM = /am/i.test(timeVal);
    const cleaned = timeVal.replace(/(am|pm)/gi, '').trim();
    const parts = cleaned.split(':');
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10) || 0;
    if (isNaN(hours)) return d;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    d.setHours(hours, minutes, 59, 999);
  }
  return d;
};

const isEventExpired = (event) => {
  if (!event || !event.date) return false;
  const baseDate = parseEventDate(event.date);
  if (!baseDate) return false;

  let endStr = event.endTime;
  if (!endStr && typeof event.time === 'string' && event.time.includes('-')) {
    endStr = event.time.split('-')[1]?.trim();
  }

  const endDateTime = parseEndDateTime(baseDate, endStr);
  return new Date().getTime() > endDateTime.getTime();
};

const formatLocalEventDate = (dateVal, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  const parsed = parseEventDate(dateVal);
  if (!parsed) return String(dateVal || '');
  return parsed.toLocaleDateString('en-US', options);
};

const getTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';

  if (typeof dateStr === 'string' && dateStr.length === 10) {
    const parsed = parseEventDate(dateStr);
    const now = new Date();
    if (
      parsed &&
      parsed.getFullYear() === now.getFullYear() &&
      parsed.getMonth() === now.getMonth() &&
      parsed.getDate() === now.getDate()
    ) {
      return 'Today';
    }
  }

  const date = Array.isArray(dateStr)
    ? new Date(dateStr[0], (dateStr[1] || 1) - 1, dateStr[2] || 1, dateStr[3] || 0, dateStr[4] || 0)
    : new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds) || seconds < 120) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(seconds / 3600);

  const isSameDay = now.toDateString() === date.toDateString();
  if (isSameDay && hours > 6) return 'Today';

  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(seconds / 2592000);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

const StudentOverviewTab = ({ setActiveTab, showToast }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ approved: 0, pending: 0 });
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    regId: null,
    eventTitle: '',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchOverviewData = async () => {
      try {
        const regsRes = await getMyRegistrationsApi();
        const myRegistrations = regsRes.data || [];

        const approvedRegs = myRegistrations.filter((reg) => reg.status === 'approved');
        const pendingCount = myRegistrations.filter((reg) => reg.status === 'pending').length;

        const upcomingList = approvedRegs
          .map((reg) => reg.event)
          .filter((event) => Boolean(event && event.date && !isEventExpired(event)))
          .sort((a, b) => (parseEventDate(a.date)?.getTime() || 0) - (parseEventDate(b.date)?.getTime() || 0));

        const eventsRes = await getAllEventsApi();
        const allEvents = eventsRes.data || [];

        const availableEvents = allEvents.filter((event) => {
          const isRegistered = myRegistrations.some(
            (reg) => (reg.event?._id || reg.event?.id) === (event._id || event.id)
          );
          return !isRegistered && !isEventExpired(event);
        });

        if (isMounted) {
          setStats({ approved: approvedRegs.length, pending: pendingCount });
          setUpcomingEvents(upcomingList.slice(0, 2));
          setRecentActivity(myRegistrations.slice(0, 5));
          setSuggestedEvents(availableEvents.slice(0, 2));
        }
      } catch {
        // Graceful error fallback
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOverviewData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshOverviewData = async () => {
    try {
      const regsRes = await getMyRegistrationsApi();
      const myRegistrations = regsRes.data || [];

      const approvedRegs = myRegistrations.filter((reg) => reg.status === 'approved');
      const pendingCount = myRegistrations.filter((reg) => reg.status === 'pending').length;
      setStats({ approved: approvedRegs.length, pending: pendingCount });

      const upcomingList = approvedRegs
        .map((reg) => reg.event)
        .filter((event) => Boolean(event && event.date && !isEventExpired(event)))
        .sort((a, b) => (parseEventDate(a.date)?.getTime() || 0) - (parseEventDate(b.date)?.getTime() || 0));

      setUpcomingEvents(upcomingList.slice(0, 2));
      setRecentActivity(myRegistrations.slice(0, 5));

      const eventsRes = await getAllEventsApi();
      const allEvents = eventsRes.data || [];

      const availableEvents = allEvents.filter((event) => {
        const isRegistered = myRegistrations.some(
          (reg) => (reg.event?._id || reg.event?.id) === (event._id || event.id)
        );
        return !isRegistered && !isEventExpired(event);
      });

      setSuggestedEvents(availableEvents.slice(0, 2));
    } catch {
      // Graceful fallback
    }
  };

  const promptCancelRequest = (id, eventTitle) => {
    setConfirmModal({
      isOpen: true,
      regId: id,
      eventTitle: eventTitle || 'this event',
    });
  };

  const handleConfirmCancel = async () => {
    if (!confirmModal.regId) return;
    try {
      await cancelRegistrationApi(confirmModal.regId);
      if (showToast) showToast('Registration cancelled successfully', 'info');
      setConfirmModal({ isOpen: false, regId: null, eventTitle: '' });
      refreshOverviewData();
    } catch {
      if (showToast) showToast('Failed to cancel request', 'error');
    }
  };

  const handleQuickRegister = async (event) => {
    const attendees = event.approvedAttendees ?? event.approvedCount ?? 0;
    const capacity = event.capacity || event.maxAttendees || 100;

    if (attendees >= capacity) {
      if (showToast) showToast('This event is already full! Registration closed.', 'error');
      return;
    }

    try {
      await registerForEventApi(event._id || event.id);
      if (showToast) showToast(`Applied for "${event.title || event.name}" successfully!`, 'success');
      refreshOverviewData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register for this event';
      if (showToast) showToast(msg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="student-overview-container">
        <div className="stats-grid">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="overview-main-grid" style={{ marginTop: '24px' }}>
          <div className="main-column">
            <div className="modern-view-section">
              <div className="skeleton-box" style={{ width: '150px', height: '22px', marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="skeleton-box" style={{ width: '100%', height: '70px', borderRadius: '12px' }} />
                <div className="skeleton-box" style={{ width: '100%', height: '70px', borderRadius: '12px' }} />
              </div>
            </div>
          </div>
          <div className="side-column">
            <div className="modern-view-section">
              <div className="skeleton-box" style={{ width: '150px', height: '22px', marginBottom: '16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton-box" style={{ width: '100%', height: '50px', borderRadius: '10px' }} />
                <div className="skeleton-box" style={{ width: '100%', height: '50px', borderRadius: '10px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-overview-container">
      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmModal({ isOpen: false, regId: null, eventTitle: '' })}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h4>Cancel Registration</h4>
            <p>
              Are you sure you want to cancel your registration for <strong>"{confirmModal.eventTitle}"</strong>?
            </p>
            <div className="confirm-modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setConfirmModal({ isOpen: false, regId: null, eventTitle: '' })}
              >
                No, Keep It
              </button>
              <button className="btn-modal-confirm" onClick={handleConfirmCancel}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard title="Approved Tickets" value={stats.approved} icon={<CheckCircle size={24} />} />
        <StatCard title="Pending Requests" value={stats.pending} icon={<Clock size={24} />} />
      </div>

      {/* Upcoming Events Section (Displays up to 2 closest approved events) */}
      {upcomingEvents.length > 0 ? (
        <div className="upcoming-events-section">
          <div className="upcoming-events-grid">
            {upcomingEvents.map((event) => (
              <div key={event._id || event.id} className="modern-view-section next-event-card">
                <div className="next-event-content">
                  <div className="next-event-badge">
                    <CalendarCheck size={14} /> Upcoming Next
                  </div>
                  <h3>{event.title || event.name}</h3>
                  <div className="next-event-details">
                    <span>
                      <Clock size={15} /> {formatLocalEventDate(event.date)}
                    </span>
                    <span>
                      <MapPin size={15} /> {event.location || 'Campus'}
                    </span>
                    <span>
                      <Users size={15} /> {event.organizerName || 'Club Leader'}
                    </span>
                  </div>
                </div>
                <button className="view-ticket-btn" onClick={() => setActiveTab('tickets')}>
                  View Ticket
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="modern-view-section next-event-card empty-next-event">
          <div className="next-event-content">
            <div className="next-event-badge empty-badge">
              <CalendarCheck size={14} /> Upcoming Next
            </div>
            <h3>No upcoming events yet</h3>
            <p>Once your event registration is approved, your ticket details will appear right here.</p>
          </div>
        </div>
      )}

      <div className="overview-main-grid">
        <div className="main-column">
          <div className="modern-view-section">
            <div className="section-header">
              <div>
                <h3 className="section-heading">Suggested For You</h3>
                <p className="text-secondary section-sub-zero">Curated events to boost your skills.</p>
              </div>
              <button className="view-all-btn" onClick={() => navigate('/explore')}>
                View All
              </button>
            </div>

            {suggestedEvents.length === 0 ? (
              <div className="empty-state-box">
                <p>No new events available at the moment. Check back later!</p>
              </div>
            ) : (
              <div className="suggested-events-grid">
                {suggestedEvents.map((event) => {
                  const attendees = Number(event.approvedAttendees ?? event.approvedCount ?? 0);
                  const capacity = Number(event.capacity ?? event.maxSeats ?? event.maxAttendees ?? 0);
                  const isFull = capacity > 0 && attendees >= capacity;
                  const organizerDisplay = event.organizerName || event.organizer?.name || 'Community Leader';

                  return (
                    <div key={event._id || event.id} className="suggested-event-card">
                      <div className="event-card-header">
                        <span className="event-status-badge">{event.category || 'Event'}</span>
                        <span className="event-date">
                          {formatLocalEventDate(event.date, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="event-title">{event.title || event.name}</h4>

                      <p className="event-club">
                        <Users size={14} /> <strong>{organizerDisplay}</strong>
                      </p>

                      <div className="suggested-card-actions-equal">
                        <button
                          className="action-btn-half btn-details"
                          onClick={() => navigate(`/event/${event._id || event.id}`)}
                        >
                          Details
                        </button>
                        <button
                          className={`action-btn-half btn-join ${isFull ? 'disabled-full' : ''}`}
                          onClick={() => handleQuickRegister(event)}
                          disabled={isFull}
                        >
                          {isFull ? 'Full' : 'Join Event'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="side-column">
          <div className="modern-view-section activity-section">
            <h3 className="section-heading activity-heading-flex">
              <Activity size={20} className="text-primary" /> Recent Activity
            </h3>

            {recentActivity.length === 0 ? (
              <p className="text-secondary activity-empty-text">No recent activity yet.</p>
            ) : (
              <div className="activity-timeline">
                {recentActivity.map((activity) => {
                  const statusKey = (activity.status || 'pending').toLowerCase();
                  const eventName = activity.event?.title || activity.event?.name || 'an event';

                  return (
                    <div key={activity._id || activity.id} className="activity-item">
                      <div className={`activity-dot ${statusKey}`}></div>

                      <div className="activity-content">
                        <p className="activity-text">
                          Registration <strong className={`status-text-${statusKey}`}>{activity.status}</strong> for{' '}
                          <span
                            className="activity-link"
                            onClick={() =>
                              statusKey === 'approved'
                                ? setActiveTab('tickets')
                                : navigate(`/event/${activity.event?._id || activity.event?.id}`)
                            }
                          >
                            {eventName}
                          </span>
                        </p>
                        <span className="activity-time">{getTimeAgo(activity.createdAt || activity.appliedOn)}</span>
                      </div>

                      <div className="activity-actions">
                        {statusKey === 'pending' && (
                          <button
                            className="action-btn cancel-btn"
                            title="Cancel Request"
                            onClick={() => promptCancelRequest(activity._id || activity.id, eventName)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        {statusKey === 'approved' && (
                          <button
                            className="action-btn view-btn"
                            title="View Ticket"
                            onClick={() => setActiveTab('tickets')}
                          >
                            <Ticket size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewTab;
