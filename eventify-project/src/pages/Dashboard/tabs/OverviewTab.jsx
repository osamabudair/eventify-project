import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Loader2, Edit, Trash2, ArrowRight, UserPlus, Activity, Lock } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import CreateEventModal from '../../../components/createEventModel/CreateEventModal'; 
import EventAttendeesModal from '../../../components/EventAttendeesModal/EventAttendeesModal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import { getLeaderDashboardApi, deleteEventApi, getEventByIdApi } from '../../../api/axiosInstance';
import './OverviewTab.css';

const getTimeAgo = (dateStr) => {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds) || seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
};

// --- دوال ضبط التواريخ والأوقات الدقيقة الموحدة ---
const parseEventDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('-');
    // صيغة yyyy-MM-dd
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    // صيغة d-M-yyyy (اليوم-الشهر-السنة)
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? new Date() : d;
};

const parseTimeOnDate = (baseDate, timeStr, defaultHour, defaultMinute) => {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  if (!timeStr) {
    d.setHours(defaultHour, defaultMinute, 0, 0);
    return d;
  }
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const cleaned = timeStr.replace(/(am|pm)/gi, '').trim();
  const parts = cleaned.split(':');

  let hours = parseInt(parts[0], 10) || 0;
  let minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  d.setHours(hours, minutes, 0, 0);
  return d;
};

// فحص الحالة الدقيقة
const getEventDynamicStatus = (event) => {
  if (!event || !event.date) return 'Upcoming';

  const now = new Date();
  const eventBaseDate = parseEventDate(event.date);

  let startStr = event.startTime;
  let endStr = event.endTime;

  if ((!startStr || !endStr) && event.time && event.time.includes('-')) {
    const timeParts = event.time.split('-');
    startStr = startStr || timeParts[0]?.trim();
    endStr = endStr || timeParts[1]?.trim();
  }

  // إذا لم يتوفر وقت بداية محدد، يبدأ الفحص من 09:00 صباحاً
  const startDateTime = parseTimeOnDate(eventBaseDate, startStr, 9, 0);
  const endDateTime = parseTimeOnDate(eventBaseDate, endStr, 23, 59);

  if (now < startDateTime) {
    return 'Upcoming';
  } else if (now >= startDateTime && now <= endDateTime) {
    return 'Ongoing';
  } else {
    return 'Completed';
  }
};

const formatDisplayDate = (dateVal) => {
  if (!dateVal) return '';
  const d = parseEventDate(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
};

const OverviewTab = ({ setActiveTab, showToast }) => {
  const [dashboardData, setDashboardData] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    pendingRequests: 0,
    recentEvents: [],
    liveActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Attendees Modal
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [viewAttendeesEvent, setViewAttendeesEvent] = useState(null);

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, eventId: null, eventName: '' });

  const fetchOverviewData = async () => {
    try {
      const data = await getLeaderDashboardApi();
      setDashboardData({
        totalEvents: data.totalEvents || 0,
        totalRegistrations: data.totalRegistrations || 0,
        pendingRequests: data.pendingRequests || 0,
        recentEvents: data.recentEvents || [],
        liveActivities: data.liveActivities || []
      });
    } catch (error) {
      console.error("Error fetching overview data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const stats = [
    { title: 'Total Events', value: dashboardData.totalEvents.toString(), icon: <Calendar size={24} /> },
    { title: 'Total Registrations', value: dashboardData.totalRegistrations.toString(), icon: <Users size={24} /> },
    { title: 'Pending Requests', value: dashboardData.pendingRequests.toString(), icon: <Clock size={24} /> },
  ];

  const handleEdit = async (event, e) => {
    e.stopPropagation();
    const status = getEventDynamicStatus(event);
    if (status === 'Completed') {
      if (showToast) showToast("Completed events cannot be edited.", "info");
      return;
    }
    try {
      const res = await getEventByIdApi(event.id);
      setSelectedEvent(res.data);
      setIsEditModalOpen(true);
    } catch {
      if (showToast) showToast("Failed to load event details", "error");
    }
  };

  const promptDeleteEvent = (eventId, eventName, e) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, eventId, eventName });
  };

  const executeDeleteEvent = async () => {
    const { eventId, eventName } = deleteDialog;
    setDeleteDialog({ isOpen: false, eventId: null, eventName: '' });
    try {
      await deleteEventApi(eventId);
      setDashboardData(prev => ({
        ...prev,
        totalEvents: Math.max(0, prev.totalEvents - 1),
        recentEvents: prev.recentEvents.filter(ev => ev.id !== eventId)
      }));
      if (showToast) showToast(`"${eventName}" deleted successfully!`, "success");
    } catch {
      if (showToast) showToast("Failed to delete event", "error");
    }
  };

  const handleOpenAttendees = (event) => {
    setViewAttendeesEvent(event);
    setIsAttendeesModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="overview-loading-container">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteDialog.eventName}"?`}
        confirmText="Yes, Delete"
        onConfirm={executeDeleteEvent}
        onCancel={() => setDeleteDialog({ isOpen: false, eventId: null, eventName: '' })}
      />

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="overview-main-grid">
        <div className="main-column">
          <div className="modern-view-section">
            <div className="section-header">
              <h3 className="section-heading">Recent Events</h3>
              <button className="view-all-btn" onClick={() => setActiveTab('manage')}>
                View All <ArrowRight size={16} />
              </button>
            </div>

            <div className="table-container">
              <table className="events-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Attendees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentEvents.length > 0 ? (
                    dashboardData.recentEvents.slice(0, 4).map((event) => {
                      const dynamicStatus = getEventDynamicStatus(event);
                      const isCompleted = dynamicStatus === 'Completed';

                      return (
                        <tr
                          key={event.id}
                          className="clickable-event-row"
                          onClick={() => handleOpenAttendees(event)}
                          title="Click to view approved attendees list"
                        >
                          <td className="font-semibold">{event.name}</td>
                          <td>{formatDisplayDate(event.date)}</td>
                          <td>
                            <span className="attendees-badge-click">
                              <Users size={13} /> {event.approvedAttendees ?? 0} / {event.capacity}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${dynamicStatus.toLowerCase()}`}>
                              {dynamicStatus}
                            </span>
                          </td>
                          <td>
                            <div className="actions-wrapper">
                              {isCompleted ? (
                                <span className="action-disabled-tag" title="Completed event is locked">
                                  <Lock size={14} /> Locked
                                </span>
                              ) : (
                                <button className="action-btn edit" onClick={(e) => handleEdit(event, e)}>
                                  <Edit size={16} /> Edit
                                </button>
                              )}
                              <button 
                                className="action-btn delete" 
                                onClick={(e) => promptDeleteEvent(event.id, event.name, e)}
                              >
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        No events found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="side-column">
          <div className="modern-view-section">
            <div className="section-header">
              <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} className="text-primary" /> Live Activity
              </h3>
            </div>

            <div className="activity-feed">
              {dashboardData.liveActivities.length > 0 ? (
                dashboardData.liveActivities.slice(0, 4).map((activity, index) => (
                  <div key={activity.id || index} className="feed-item">
                    <div className="feed-icon">
                      <UserPlus size={16} />
                    </div>
                    <div className="feed-content">
                      <p><strong>{activity.studentName || 'Student'}</strong> registered for</p>
                      <span className="feed-event">{activity.eventName || 'an event'}</span>
                      <span className="feed-time">{getTimeAgo(activity.appliedOn)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
                  No recent registrations.
                </p>
              )}
            </div>

            <button
              className="view-all-btn"
              style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
              onClick={() => setActiveTab('registrations')}
            >
              Manage Registrations
            </button>
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setTimeout(() => setSelectedEvent(null), 300);
        }}
        eventData={selectedEvent}
        showToast={showToast}
        onEventUpdated={() => {
          fetchOverviewData();
        }}
      />

      <EventAttendeesModal
        isOpen={isAttendeesModalOpen}
        onClose={() => {
          setIsAttendeesModalOpen(false);
          setViewAttendeesEvent(null);
        }}
        event={viewAttendeesEvent}
        showToast={showToast}
        onAttendeeRemoved={() => {
          fetchOverviewData();
        }}
      />
    </div>
  );
};

export default OverviewTab;