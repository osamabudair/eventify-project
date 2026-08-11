import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ArrowRight, Users, Loader2, CalendarCheck, Activity, MapPin } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrationsApi, getAllEventsApi } from '../../../api/axiosInstance';
import './StudentOverviewTab.css';

const StudentOverviewTab = ({ setActiveTab }) => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ approved: 0, pending: 0 });
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const regsRes = await getMyRegistrationsApi();
        const myRegistrations = regsRes.data;
        
        const approvedRegs = myRegistrations.filter(reg => reg.status === 'approved');
        const pendingCount = myRegistrations.filter(reg => reg.status === 'pending').length;
        setStats({ approved: approvedRegs.length, pending: pendingCount });

        const upcoming = approvedRegs
          .map(reg => reg.event)
          .filter(event => event && new Date(event.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
        setNextEvent(upcoming || null);

        setRecentActivity(myRegistrations.slice(0, 4));

        // 4. الفعاليات المقترحة
        const eventsRes = await getAllEventsApi();
        const allEvents = eventsRes.data;
        const myEventIds = myRegistrations.map(reg => reg.event?._id);
        const availableEvents = allEvents.filter(event => !myEventIds.includes(event._id));
        setSuggestedEvents(availableEvents.slice(0, 2));

      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-color)' }} />
      </div>
    );
  }

  return (
    <div className="student-overview-container">

      <div className="stats-grid">
        <StatCard title="Approved Tickets" value={stats.approved} icon={<CheckCircle size={24} />} />
        <StatCard title="Pending Requests" value={stats.pending} icon={<Clock size={24} />} />
      </div>

      {nextEvent && (
        <div className="modern-view-section next-event-card">
          <div className="next-event-content">
            <div className="next-event-badge">
              <CalendarCheck size={16} /> Upcoming Next
            </div>
            <h3>{nextEvent.title}</h3>
            <div className="next-event-details">
              <span><Clock size={16} /> {new Date(nextEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              <span><MapPin size={16} /> {nextEvent.location || 'TBA'}</span>
            </div>
          </div>
          <button className="view-ticket-btn" onClick={() => setActiveTab('tickets')}>
            View Ticket
          </button>
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
                {suggestedEvents.map(event => (
                  <div key={event._id} className="suggested-event-card">
                    <div className="event-card-header">
                      <span className="event-status-badge">{event.category || 'Event'}</span>
                      <span className="event-date">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="event-title">{event.title}</h4>
                    <p className="event-club"><Users size={14} /> {event.location || 'TBA'}</p>
                    <button className="view-details-btn" onClick={() => navigate(`/event/${event._id}`)}>
                      View Details <ArrowRight size={18} />
                    </button>
                  </div>
                ))}
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
                {recentActivity.map((activity) => (
                  <div key={activity._id} className="activity-item">
                    <div className={`activity-dot ${activity.status}`}></div>
                    <div className="activity-content">
                      <p className="activity-text">
                        Registration <strong>{activity.status}</strong> for <em>{activity.event?.title || 'an event'}</em>
                      </p>
                      <span className="activity-time">
                        {new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentOverviewTab;