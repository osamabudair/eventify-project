import React from 'react';
import { Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import { useNavigate } from 'react-router-dom';

const StudentOverviewTab = () => {
  const navigate = useNavigate();

  // فعاليات مقترحة تناسب اهتمامات الطالب
  const suggestedEvents = [
    {
      id: 10,
      title: "Advanced React & Vite Architecture",
      date: "July 18, 2026",
      club: "Tech Club",
      status: "Open"
    },
    {
      id: 11,
      title: "Java Full-Stack Development",
      date: "July 25, 2026",
      club: "Software Engineering Club",
      status: "Filling Fast"
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="stats-grid">
        <StatCard title="Upcoming Events" value="2" icon={<Calendar size={24} />} />
        <StatCard title="Approved Tickets" value="5" icon={<CheckCircle size={24} />} />
      </div>
      
      <div className="modern-view-section" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 className="section-heading" style={{ marginBottom: '8px' }}>Suggested For You</h3>
            <p className="text-secondary" style={{ margin: 0 }}>Curated events to boost your technical skills.</p>
          </div>
          <button className="view-all-btn" onClick={() => navigate('/')}>View All</button>
        </div>
        
        <div className="suggested-events-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {suggestedEvents.map(event => (
            <div key={event.id} className="suggested-event-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)', backgroundColor: 'var(--tag-bg)', padding: '4px 10px', borderRadius: '8px' }}>{event.status}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{event.date}</span>
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)' }}>{event.title}</h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{event.club}</p>
              <button style={{ width: '100%', padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => navigate(`/event/${event.id}`)}>
                View Details <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewTab;