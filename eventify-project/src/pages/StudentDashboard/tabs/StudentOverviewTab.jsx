import React from 'react';
import { Calendar, CheckCircle, ArrowRight, Users } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { useNavigate } from 'react-router-dom';
import './StudentOverviewTab.css'; 

const StudentOverviewTab = () => {
  const navigate = useNavigate();

  const suggestedEvents = [
    {
      id: 10,
      title: "Java Backend Engineering Bootcamp",
      date: "Aug 15, 2026",
      club: "Software Engineering Club",
      status: "Open"
    },
    {
      id: 11,
      title: "Advanced React & Node.js Architecture",
      date: "Aug 22, 2026",
      club: "Tech Club",
      status: "Filling Fast"
    }
  ];

  return (
    <div className="student-overview-container">
      {/* قسم الإحصائيات */}
      <div className="stats-grid">
        <StatCard title="Upcoming Events" value="2" icon={<Calendar size={24} />} />
        <StatCard title="Approved Tickets" value="5" icon={<CheckCircle size={24} />} />
      </div>
      
      {/* قسم الفعاليات المقترحة */}
      <div className="modern-view-section">
        <div className="section-header">
          <div>
            <h3 className="section-heading">Suggested For You</h3>
            <p className="text-secondary" style={{ margin: 0 }}>Curated events to boost your technical skills.</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate('/events')}>View All</button>
        </div>
        
        <div className="suggested-events-grid">
          {suggestedEvents.map(event => (
            <div key={event.id} className="suggested-event-card">
              <div className="event-card-header">
                <span className="event-status-badge">{event.status}</span>
                <span className="event-date">{event.date}</span>
              </div>
              
              <h4 className="event-title">{event.title}</h4>
              <p className="event-club">
                <Users size={14} /> {event.club}
              </p>
              
              <button 
                className="view-details-btn" 
                onClick={() => navigate(`/event/${event.id}`)}
              >
                View Details <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewTab;