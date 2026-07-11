import React from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import './EventRegistrationCard.css'; 

const EventRegistrationCard = ({ event, isRegistered, onRegister }) => {
  return (
    <div className="modern-registration-card">
      <h3 className="card-title">Event Details</h3>
      
      <div className="details-list">
        
        <div className="detail-row">
          <div className="icon-wrapper">
            <Calendar size={22} />
          </div>
          <div className="detail-text">
            <span className="label">Date</span>
            <span className="value">{event.date}</span>
          </div>
        </div>
        
        <div className="detail-row">
          <div className="icon-wrapper">
            <Clock size={22} />
          </div>
          <div className="detail-text">
            <span className="label">Time</span>
            <span className="value">{event.time}</span>
          </div>
        </div>
        
        <div className="detail-row">
          <div className="icon-wrapper">
            <MapPin size={22} />
          </div>
          <div className="detail-text">
            <span className="label">Location</span>
            <span className="value">{event.location}</span>
          </div>
        </div>
        
        <div className="detail-row">
          <div className="icon-wrapper">
            <Users size={22} />
          </div>
          <div className="detail-text">
            <span className="label">Organized By</span>
            <span className="value">{event.club}</span>
          </div>
        </div>

      </div>

      <button 
        className={`register-btn-modern ${isRegistered ? 'registered' : ''}`}
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