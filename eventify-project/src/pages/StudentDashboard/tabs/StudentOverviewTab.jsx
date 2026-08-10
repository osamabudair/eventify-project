import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ArrowRight, Users, Loader2 } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrationsApi, getAllEventsApi } from '../../../api/axiosInstance';
import './StudentOverviewTab.css';

const StudentOverviewTab = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ approved: 0, pending: 0 });
  const [suggestedEvents, setSuggestedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const regsRes = await getMyRegistrationsApi();
        const myRegistrations = regsRes.data;
        
        const approvedCount = myRegistrations.filter(reg => reg.status === 'approved').length;
        const pendingCount = myRegistrations.filter(reg => reg.status === 'pending').length;
        setStats({ approved: approvedCount, pending: pendingCount });

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
      {/* قسم الإحصائيات (مربوط بالبيانات الحقيقية) */}
      <div className="stats-grid">
        <StatCard title="Approved Tickets" value={stats.approved} icon={<CheckCircle size={24} />} />
        <StatCard title="Pending Requests" value={stats.pending} icon={<Clock size={24} />} />
      </div>
      
      {/* قسم الفعاليات المقترحة (مربوط بالبيانات الحقيقية) */}
      <div className="modern-view-section">
        <div className="section-header">
          <div>
            <h3 className="section-heading">Suggested For You</h3>
            <p className="text-secondary" style={{ margin: 0 }}>Curated events to boost your technical skills.</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate('/events')}>View All</button>
        </div>
        
        {suggestedEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
            <p>No new events available at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="suggested-events-grid">
            {suggestedEvents.map(event => (
              <div key={event._id} className="suggested-event-card">
                <div className="event-card-header">
                  {/* عرض Category كـ Badge أو Status */}
                  <span className="event-status-badge">{event.category || 'Event'}</span>
                  <span className="event-date">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                
                <h4 className="event-title">{event.title}</h4>
                <p className="event-club">
                  <Users size={14} /> {event.location || 'TBA'}
                </p>
                
                <button 
                  className="view-details-btn" 
                  onClick={() => navigate(`/event/${event._id}`)}
                >
                  View Details <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentOverviewTab;