// --- Imports ---
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Building2} from 'lucide-react';
import './EventCard.css';

const EventCard = ({ event }) => {
  // --- Hooks ---
  const navigate = useNavigate();
  
  // --- Main Render ---
  return (
    <div className="event-card">
      
      {/* Card Image */}
      <div className="card-image-wrapper">
         <img src={event.image} alt={event.title} className="card-image" />
      </div>
      
      {/* Card Content */}
      <div className="card-content">
        
        {/* Tags */}
        <div className="tags">
          {event.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        
        {/* Event Title */}
        <h4>{event.title}</h4>
        
        {/* Event Meta Info */}
        <div className="event-meta">
          <span><Calendar size={16} className="meta-icon" /> {event.date}</span>
          <span><Building2 size={16} className="meta-icon" /> {event.club}</span>
        </div>
        
        {/* Action Button */}
        <button className="details-btn" onClick={() => navigate(`/event/${event.id}`)}>
          View Details
        </button>
        
      </div>
    </div>
  );
};

export default EventCard;