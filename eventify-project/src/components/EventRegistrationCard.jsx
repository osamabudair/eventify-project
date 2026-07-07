import React from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react';

const EventRegistrationCard = ({ event, isRegistered, onRegister }) => {
  return (
    <div className="event-registration-card">
      <h3>Event Details</h3>
      
      <div className="detail-item">
        <Calendar className="detail-icon" size={24} />
        <div>
          <span className="detail-label">Date</span>
          <p>{event.date}</p>
        </div>
      </div>
      
      <div className="detail-item">
        <Clock className="detail-icon" size={24} />
        <div>
          <span className="detail-label">Time</span>
          <p>{event.time}</p>
        </div>
      </div>
      
      <div className="detail-item">
        <MapPin className="detail-icon" size={24} />
        <div>
          <span className="detail-label">Location</span>
          <p>{event.location}</p>
        </div>
      </div>
      
      <div className="detail-item">
        <Users className="detail-icon" size={24} />
        <div>
          <span className="detail-label">Organized By</span>
          <p>{event.club}</p>
        </div>
      </div>

      <button 
        className={`register-action-btn ${isRegistered ? 'registered' : ''}`}
        onClick={onRegister}
        disabled={isRegistered}
      >
        {isRegistered ? (
          <><CheckCircle size={20} /> Registered Successfully</>
        ) : (
          'Register Now'
        )}
      </button>
    </div>
  );
};

export default EventRegistrationCard;