// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Loader2, Edit, Trash2, ArrowRight, UserPlus, Activity } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import CreateEventModal from '../../../components/createEventModel/CreateEventModal'; 
import { getMyEventsApi, deleteEventApi, getOrganizerRegistrationsApi } from '../../../api/axiosInstance';
import './OverviewTab.css';

// --- Helper Functions ---
const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
};

const OverviewTab = ({ setActiveTab }) => {
  // --- State Management ---
  const [events, setEvents] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // States for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- Side Effects ---
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [eventsRes, regsRes] = await Promise.all([
          getMyEventsApi(),
          getOrganizerRegistrationsApi().catch(() => ({ data: [] })) 
        ]);
        
        setEvents(eventsRes.data);
        
        if (regsRes.data) {
          setAllRegistrations(regsRes.data);
        }
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // --- Data Calculations ---
  const totalEvents = events.length;

  const totalRegistrations = allRegistrations.filter(reg => reg.status === 'approved').length;
  const pendingRequests = allRegistrations.filter(reg => reg.status === 'pending').length;

  const stats = [
    { title: 'Total Events', value: totalEvents.toString(), icon: <Calendar size={24} /> },
    { title: 'Total Registrations', value: totalRegistrations.toString(), icon: <Users size={24} /> },
    { title: 'Pending Requests', value: pendingRequests.toString(), icon: <Clock size={24} /> },
  ];

  const recentEventsFormatted = events.slice(0, 3).map((event) => {
    const isPast = new Date(event.date) < new Date();
    return {
      _id: event._id,
      title: event.title,
      date: new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: isPast ? 'Completed' : 'Active',
      attendeesCount: event.attendees?.length || 0,
      maxAttendees: event.maxAttendees || 0,
    };
  });

  // --- Handlers ---
  const handleEdit = (fullEvent) => {
    setIsEditModalOpen(true);
    setTimeout(() => {
      setSelectedEvent(fullEvent);
    }, 50);
  };

  const handleDelete = async (eventId, eventName) => {
    if (window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      try {
        await deleteEventApi(eventId);
        setEvents(events.filter(event => event._id !== eventId));
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete event");
      }
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="overview-loading-container">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="animate-fade-in">
      
      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <div className="overview-main-grid">
        
        {/* Main Column: Recent Events Table */}
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
                  {recentEventsFormatted.length > 0 ? (
                    recentEventsFormatted.map((formattedEvent) => {
                      const originalEvent = events.find(e => e._id === formattedEvent._id);
                      
                      return (
                        <tr key={formattedEvent._id}>
                          <td className="font-semibold">{formattedEvent.title}</td>
                          <td>{formattedEvent.date}</td>
                          <td>{formattedEvent.attendeesCount} / {formattedEvent.maxAttendees}</td>
                          <td><span className={`status-badge ${formattedEvent.status.toLowerCase()}`}>{formattedEvent.status}</span></td>
                          <td>
                            <div className="actions-wrapper">
                              <button className="action-btn edit" onClick={() => handleEdit(originalEvent)}>
                                <Edit size={16} /> Edit
                              </button>
                              <button className="action-btn delete" onClick={() => handleDelete(formattedEvent._id, formattedEvent.title)}>
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

        {/* Side Column: Live Activity Feed */}
        <div className="side-column">
          <div className="modern-view-section">
            <div className="section-header">
              <h3 className="section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} className="text-primary" /> Live Activity
              </h3>
            </div>
            
            <div className="activity-feed">
              {allRegistrations.length > 0 ? (
                allRegistrations.slice(0, 4).map((reg) => (
                  <div key={reg._id} className="feed-item">
                    <div className="feed-icon">
                      <UserPlus size={16} />
                    </div>
                    <div className="feed-content">
                      <p><strong>{reg.user?.username || 'A student'}</strong> registered for</p>
                      <span className="feed-event">{reg.event?.title || 'an event'}</span>
                      <span className="feed-time">{getTimeAgo(reg.createdAt)}</span>
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

      {/* --- Edit Modal --- */}
      <CreateEventModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setTimeout(() => setSelectedEvent(null), 300);
        }} 
        eventData={selectedEvent} 
        onEventUpdated={() => {
          // التحديث الصامت للبيانات بعد التعديل
          getMyEventsApi().then(res => setEvents(res.data)).catch(err => console.error(err));
        }}
      />

    </div>
  );
};

export default OverviewTab;