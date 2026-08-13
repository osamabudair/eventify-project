import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Loader2, Edit, Trash2, ArrowRight, UserPlus, Activity } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { getMyEventsApi, deleteEventApi, getOrganizerRegistrationsApi } from '../../../api/axiosInstance';
import './OverviewTab.css';

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
  const [events, setEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [eventsRes, regsRes] = await Promise.all([
          getMyEventsApi(),
          getOrganizerRegistrationsApi().catch(() => ({ data: [] })) 
        ]);
        
        setEvents(eventsRes.data);
        
        if (regsRes.data) {
          setRecentRegistrations(regsRes.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const totalEvents = events.length;

  const totalRegistrations = events.reduce((sum, event) => {
    return sum + (event.attendees?.length || 0);
  }, 0);

  const stats = [
    { title: 'Total Events', value: totalEvents.toString(), icon: <Calendar size={24} /> },
    { title: 'Total Registrations', value: totalRegistrations.toString(), icon: <Users size={24} /> },
    { title: 'Pending Requests', value: '0', icon: <Clock size={24} /> },
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

  const handleEdit = (eventName) => alert(`Editing event: ${eventName}`);

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

  if (isLoading) {
    return (
      <div className="overview-loading-container">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
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
                  {recentEventsFormatted.length > 0 ? (
                    recentEventsFormatted.map((event) => (
                      <tr key={event._id}>
                        <td className="font-semibold">{event.title}</td>
                        <td>{event.date}</td>
                        <td>{event.attendeesCount} / {event.maxAttendees}</td>
                        <td><span className={`status-badge ${event.status.toLowerCase()}`}>{event.status}</span></td>
                        <td>
                          <div className="actions-wrapper">
                            <button className="action-btn edit" onClick={() => handleEdit(event.title)}>
                              <Edit size={16} /> Edit
                            </button>
                            <button className="action-btn delete" onClick={() => handleDelete(event._id, event.title)}>
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
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
              {recentRegistrations.length > 0 ? (
                recentRegistrations.map((reg) => (
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
    </div>
  );
};

export default OverviewTab;