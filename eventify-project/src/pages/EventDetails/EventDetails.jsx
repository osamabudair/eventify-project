// ==================== IMPORTS ====================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon, Loader2, Calendar, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { getEventByIdApi, registerForEventApi, getEventApprovedCountApi, getMyRegistrationsApi } from '../../api/axiosInstance';
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

  const toastTimerRef = React.useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

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

        let currentAttendees = data.approvedAttendees ?? data.approvedCount ?? 0;
        if (currentAttendees === 0) {
          try {
            const count = await getEventApprovedCountApi(data.id || id);
            if (count > 0) {
              currentAttendees = count;
            }
          } catch (err) {
            void err;
          }
        }
        const totalCapacity = Number(data.capacity ?? data.maxAttendees ?? data.maxSeats ?? 0);
        const isEventFull = totalCapacity > 0 && currentAttendees >= totalCapacity;

        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (token && user?.role === 'STUDENT') {
          try {
            const regRes = await getMyRegistrationsApi();
            const myRegs = regRes.data || [];
            const isUserRegistered = myRegs.some(
              r => (r.eventId === Number(id) || r.event?.id === Number(id) || r.event?._id === Number(id)) &&
                   r.status?.toLowerCase() !== 'cancelled' && r.status?.toLowerCase() !== 'rejected'
            );
            if (isMounted && isUserRegistered) {
              setIsRegistered(true);
            }
          } catch (err) {
            void err;
          }
        }

        const formattedEvent = {
          id: data.id || data._id,
          title: data.name || data.title,
          club: organizerDisplayName,
          date: formattedDate,
          time: formattedTime,
          location: data.location || "Campus",
          capacity: totalCapacity,
          approvedAttendees: currentAttendees,
          isFull: isEventFull,
          image: data.imageUrl || data.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1400",
          description: data.description || "No description provided for this event.",
          tags: [data.category || 'General']
        };

        if (isMounted) {
          setEvent(formattedEvent);
          document.title = `${formattedEvent.title} - Eventify`;
        }
      } catch {
        if (isMounted) {
          setErrorMsg("Failed to load event details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEventData();

    return () => {
      isMounted = false;
    };
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
        <h2 className="event-error-heading">{errorMsg || "Event not found"}</h2>
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={18} /> Go Back</button>
      </div>
    );
  }

  const capacity = Number(event.capacity ?? event.maxSeats ?? event.maxAttendees ?? 0);
  const registered = Number(event.registeredCount ?? event.approvedAttendees ?? event.approvedCount ?? 0);
  const seatsLeft = Math.max(0, capacity - registered);
  const fillPercentage = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;

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
                    <span>Attendance ({capacity > 0 ? `${seatsLeft} seats left` : 'Open'})</span>
                    <strong>{registered} / {capacity}</strong>
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