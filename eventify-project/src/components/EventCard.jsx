import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  
  return (
    <div className="event-card">
      <div className="card-image-wrapper">
         <img src={event.image} alt={event.title} className="card-image" />
      </div>
      <div className="card-content">
        <div className="tags">
          {event.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        <h4>{event.title}</h4>
        <div className="event-meta">
          <span>📅 {event.date}</span>
          <span>🏢 {event.club}</span>
        </div>
        <button className="details-btn" onClick={() => navigate(`/event/${event.id}`)}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;