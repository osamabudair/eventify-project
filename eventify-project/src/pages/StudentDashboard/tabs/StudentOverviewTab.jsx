// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Users, Loader2, CalendarCheck, Activity, MapPin, Trash2, Ticket, AlertTriangle } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrationsApi, getAllEventsApi, cancelRegistrationApi, registerForEventApi } from '../../../api/axiosInstance';
import './StudentOverviewTab.css';

// --- Helper Functions ---
const getTimeAgo = (dateStr) => {
  if (!dateStr) return "Just now";

  if (typeof dateStr === 'string' && dateStr.length === 10) {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return "Today";
  }

  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds) || seconds < 120) return "Just now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(seconds / 3600);
  
  const isSameDay = now.toDateString() === date.toDateString();
  if (isSameDay && hours > 6) return "Today";

  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(seconds / 2592000);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
};

const isEventExpired = (event) => {
  if (!event || !event.date) return false;
  const now = new Date();
  let eventDate = new Date(event.date);

  if (event.endTime) {
    const isPM = /pm/i.test(event.endTime);
    const isAM = /am/i.test(event.endTime);
    const cleaned = event.endTime.replace(/(am|pm)/gi, '').trim();
    const parts = cleaned.split(':');
    let hours = parseInt(parts[0], 10) || 0;
    let minutes = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    eventDate.setHours(hours, minutes, 0, 0);
  } else {
    eventDate.setHours(23, 59, 59, 999);
  }
  return now > eventDate;
};

const StudentOverviewTab = ({ setActiveTab, showToast }) => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ approved: 0, pending: 0 });
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    regId: null,
    eventTitle: ''
  });

  const fetchOverviewData = async () => {
    try {
      const regsRes = await getMyRegistrationsApi();
      const myRegistrations = regsRes.data || [];
      
      const approvedRegs = myRegistrations.filter(reg => reg.status === 'approved');
      const pendingCount = myRegistrations.filter(reg => reg.status === 'pending').length;
      setStats({ approved: approvedRegs.length, pending: pendingCount });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = approvedRegs
        .map(reg => reg.event)
        .filter(event => {
          if (!event || !event.date) return false;
          return new Date(event.date) >= today && !isEventExpired(event);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      setNextEvent(upcoming || (approvedRegs[0]?.event && !isEventExpired(approvedRegs[0].event) ? approvedRegs[0].event : null));
      setRecentActivity(myRegistrations.slice(0, 5));

      const eventsRes = await getAllEventsApi();
      const allEvents = eventsRes.data || [];

      const availableEvents = allEvents.filter(event => {
        const isRegistered = myRegistrations.some(reg => (reg.event?._id || reg.event?.id) === (event._id || event.id));
        return !isRegistered && !isEventExpired(event);
      });

      setSuggestedEvents(availableEvents.slice(0, 2));
    } catch (error) {
      console.error("Error fetching student overview:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const promptCancelRequest = (id, eventTitle) => {
    setConfirmModal({
      isOpen: true,
      regId: id,
      eventTitle: eventTitle || 'this event'
    });
  };

  const handleConfirmCancel = async () => {
    if (!confirmModal.regId) return;
    try {
      await cancelRegistrationApi(confirmModal.regId);
      if (showToast) showToast("Registration cancelled successfully", "info");
      setConfirmModal({ isOpen: false, regId: null, eventTitle: '' });
      fetchOverviewData(); 
    } catch {
      if (showToast) showToast("Failed to cancel request", "error");
    }
  };

  const handleQuickRegister = async (event) => {
    const attendees = event.approvedAttendees ?? event.approvedCount ?? 0;
    const capacity = event.capacity || event.maxAttendees || 100;

    if (attendees >= capacity) {
      if (showToast) showToast("This event is already full! Registration closed.", "error");
      return;
    }

    try {
      await registerForEventApi(event._id || event.id);
      if (showToast) showToast(`Applied for "${event.title || event.name}" successfully!`, "success");
      fetchOverviewData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to register for this event";
      if (showToast) showToast(msg, "error");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-color)' }} />
      </div>
    );
  }

  return (
    <div className="student-overview-container">
      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="confirm-modal-overlay" onClick={() => setConfirmModal({ isOpen: false, regId: null, eventTitle: '' })}>
          <div className="confirm-modal-card" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h4>Cancel Registration</h4>
            <p>Are you sure you want to cancel your registration for <strong>"{confirmModal.eventTitle}"</strong>?</p>
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

      {/* Next Upcoming Event Card */}
      {nextEvent ? (
        <div className="modern-view-section next-event-card">
          <div className="next-event-content">
            <div className="next-event-badge">
              <CalendarCheck size={16} /> Upcoming Next
            </div>
            <h3>{nextEvent.title || nextEvent.name}</h3>
            <div className="next-event-details">
              <span><Clock size={16} /> {new Date(nextEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span><MapPin size={16} /> {nextEvent.location || 'Campus'}</span>
              <span><Users size={16} /> {nextEvent.organizerName || 'Club Leader'}</span>
            </div>
          </div>
          <button className="view-ticket-btn" onClick={() => setActiveTab('tickets')}>
            View Ticket
          </button>
        </div>
      ) : (
        <div className="modern-view-section next-event-card empty-next-event">
          <div className="next-event-content">
            <div className="next-event-badge empty-badge">
              <CalendarCheck size={16} /> Upcoming Next
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
                <p className="text-secondary" style={{ margin: 0 }}>Curated events to boost your skills.</p>
              </div>
              <button className="view-all-btn" onClick={() => navigate('/explore')}>View All</button>
            </div>
            
            {suggestedEvents.length === 0 ? (
              <div className="empty-state-box">
                <p>No new events available at the moment. Check back later!</p>
              </div>
            ) : (
              <div className="suggested-events-grid">
                {suggestedEvents.map(event => {
                  const attendees = event.approvedAttendees ?? event.approvedCount ?? 0;
                  const capacity = event.capacity || event.maxAttendees || 100;
                  const isFull = attendees >= capacity;
                  const organizerDisplay = event.organizerName || event.organizer?.name || 'Osama Bd';

                  return (
                    <div key={event._id || event.id} className="suggested-event-card">
                      <div className="event-card-header">
                        <span className="event-status-badge">{event.category || 'Event'}</span>
                        <span className="event-date">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="event-title">{event.title || event.name}</h4>
                      
                      <p className="event-club">
                        <Users size={14} /> <strong>{organizerDisplay}</strong>
                      </p>
                      
                      <div className="event-capacity-tag">
                        <span>{attendees} / {capacity} Registered</span>
                        {isFull && <span className="full-badge">Full</span>}
                      </div>

                      {/* أزرار متساوية الحجم بحركات hover أنيقة */}
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
            <h3 className="section-heading" style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} className="text-primary" /> Recent Activity
            </h3>
            
            {recentActivity.length === 0 ? (
              <p className="text-secondary" style={{ fontSize: '0.9rem', textAlign: 'center' }}>No recent activity yet.</p>
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
                            onClick={() => statusKey === 'approved' ? setActiveTab('tickets') : navigate(`/event/${activity.event?._id || activity.event?.id}`)}
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