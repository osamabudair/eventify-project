// ==================== IMPORTS ====================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon, Loader2, Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { getEventByIdApi, registerForEventApi, getEventApprovedCountApi } from '../../api/axiosInstance';
import './EventDetails.css';

// ==================== COMPONENT ====================
const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const res = await getEventByIdApi(id);
        const data = res.data;
        
        const formattedTime = (data.startTime && data.endTime) 
          ? `${data.startTime} - ${data.endTime}` 
          : (data.time || "10:00 AM - 02:00 PM");

        let formattedDate = data.date;
        if (data.date) {
          const dateObj = new Date(data.date);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
          }
        }

        const organizerDisplayName = 
          data.organizer?.name || 
          data.organizer?.fullName || 
          data.organizer?.username || 
          data.organizerName || 
          "University Club";

        // العدد الحقيقي للحضور المقبولين (الـ endpoint تبع الفعالية ما بيرجع العدد)
        let currentAttendees = data.approvedAttendees ?? data.approvedCount ?? 0;
        try {
          currentAttendees = await getEventApprovedCountApi(data.id || id);
        } catch (countError) {
          console.error("Error fetching attendees count:", countError);
        }
        const totalCapacity = data.capacity || data.maxAttendees || 100;

        const formattedEvent = {
          id: data.id || data._id,
          title: data.name || data.title,
          club: organizerDisplayName,
          date: formattedDate,
          time: formattedTime,
          location: data.location || "Campus",
          capacity: totalCapacity,
          approvedAttendees: currentAttendees,
          isFull: currentAttendees >= totalCapacity,
          image: data.imageUrl || data.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1400",
          description: data.description || "No description provided for this event.",
          tags: [data.category || 'General']
        };

        setEvent(formattedEvent);
        document.title = `${formattedEvent.title} - Eventify`;
      } catch (error) {
        console.error("Error fetching event details:", error);
        setErrorMsg("Failed to load event details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user) {
      showToast("You must be logged in to register for events!", "error");
      setTimeout(() => navigate('/auth'), 1500);
      return;
    }

    if (user.role === 'CLUB_LEADER') {
      showToast("Club Leaders cannot register as attendees!", "error");
      return;
    }

    if (event.isFull) {
      showToast("This event has reached full capacity!", "error");
      return;
    }

    try {
      await registerForEventApi(id);
      setIsRegistered(true);
      showToast("Registration submitted! Waiting for approval.", "success");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to register. Please try again.";
      showToast(msg, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="event-details-loading">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (errorMsg || !event) {
    return (
      <div className="event-details-loading">
        <h2 style={{ color: '#ef4444' }}>{errorMsg || "Event not found"}</h2>
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={18} /> Go Back</button>
      </div>
    );
  }

  const fillPercentage = Math.min(100, Math.round((event.approvedAttendees / event.capacity) * 100));

  return (
    <div className="event-details-page">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="details-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      {/* Hero Image Viewport */}
      <div className="details-hero-section">
        <div className="details-hero-card animate-fade-in">
          <img src={event.image} alt={event.title} className="hero-cover-bg" />
          <div className="hero-dark-overlay"></div>

          <div className="hero-inner-content">
            {/* Left Content */}
            <div className="hero-left-column">
              <div className="category-pill-badge">{event.tags[0]}</div>
              <h1 className="hero-event-name">{event.title}</h1>
              <div className="hero-desc-scroll">
                <p>{event.description}</p>
              </div>
            </div>

            {/* Right Modern Glass Card */}
            <div className="hero-right-column">
              <div className="glassmorphic-card">
                <div className="glass-card-header">
                  <h3>Event Overview</h3>
                  <span className={`status-pill ${event.isFull ? 'status-full' : 'status-open'}`}>
                    {event.isFull ? 'Sold Out' : 'Open'}
                  </span>
                </div>

                <div className="glass-rows-list">
                  <div className="glass-row-item">
                    <div className="glass-icon-wrapper"><Calendar size={18} /></div>
                    <div className="glass-row-text">
                      <span>Date</span>
                      <strong>{event.date}</strong>
                    </div>
                  </div>

                  <div className="glass-row-item">
                    <div className="glass-icon-wrapper"><Clock size={18} /></div>
                    <div className="glass-row-text">
                      <span>Time</span>
                      <strong>{event.time}</strong>
                    </div>
                  </div>

                  <div className="glass-row-item">
                    <div className="glass-icon-wrapper"><MapPin size={18} /></div>
                    <div className="glass-row-text">
                      <span>Location</span>
                      <strong>{event.location}</strong>
                    </div>
                  </div>

                  <div className="glass-row-item">
                    <div className="glass-icon-wrapper"><Users size={18} /></div>
                    <div className="glass-row-text">
                      <span>Organizer</span>
                      <strong>{event.club}</strong>
                    </div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="capacity-progress-container">
                  <div className="capacity-label-row">
                    <span>Attendance</span>
                    <strong>{event.approvedAttendees} / {event.capacity}</strong>
                  </div>
                  <div className="progress-track">
                    <div 
                      className={`progress-fill ${event.isFull ? 'full' : ''}`}
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Register Action Button */}
                <button 
                  className={`modern-register-btn ${event.isFull ? 'disabled' : ''} ${isRegistered ? 'registered' : ''}`}
                  onClick={handleRegister}
                  disabled={event.isFull || isRegistered}
                >
                  {isRegistered ? (
                    <><CheckCircle2 size={18} /> Registered</>
                  ) : event.isFull ? (
                    "Fully Booked"
                  ) : (
                    "Register Now"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;