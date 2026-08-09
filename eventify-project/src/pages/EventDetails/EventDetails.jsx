import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon, Loader2 } from 'lucide-react';
import EventRegistrationCard from '../../components/EventRegistrationCard/EventRegistrationCard';
import { getEventByIdApi, registerForEventApi } from '../../api/axiosInstance';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchEventData = async () => {
      try {
        const res = await getEventByIdApi(id);
        const data = res.data;
        
        // تنسيق البيانات لتناسب التصميم
        const formattedEvent = {
          id: data._id,
          title: data.title,
          club: data.organizer?.username || "University Club",
          date: new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          time: data.time || "10:00 AM - 02:00 PM",
          location: data.location,
          capacity: `${data.maxAttendees || 100} Attendees`,
          image: data.image 
            ? `http://localhost:5000${data.image.startsWith('/') ? '' : '/'}${data.image}`
            : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1400",
          description: data.description,
          tags: [data.category]
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
    if (!token) {
      alert("You must be logged in to register for events!");
      navigate('/auth');
      return;
    }

    try {
      await registerForEventApi(id);
      setIsRegistered(true);
      alert("Registration successful! Waiting for organizer approval."); 
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="event-details-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (errorMsg || !event) {
    return (
      <div className="event-details-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <h2 style={{ color: 'red' }}>{errorMsg || "Event not found"}</h2>
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={20} /> Go Back</button>
      </div>
    );
  }

  return (
    <div className="event-details-page">
      {/* navbar */}
      <nav className="details-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      {/* image section */}
      <header className="modern-hero animate-fade-in">
        <div className="hero-image-container">
          <img src={event.image} alt={event.title} className="hero-bg-image" />
          <div className="hero-gradient-overlay"></div>
          
          <div className="hero-content">
            <div className="hero-tags">
              {event.tags.map((tag, i) => (
                <span key={i} className="modern-tag">{tag}</span>
              ))}
            </div>
            <h1 className="hero-title">{event.title}</h1>
          </div>
        </div>
      </header>

      {/* main content below image */}
      <main className="modern-main-content animate-slide-up">
        <div className="content-grid">
          
          {/* Event Description Section */}
          <div className="event-description-section">
            <h2>About this event</h2>
            <div className="description-text">
              <p>{event.description}</p>
            </div>
          </div>

          {/* Event Registration Card */}
          <div className="event-sidebar">
            <EventRegistrationCard 
              event={event} 
              isRegistered={isRegistered} 
              onRegister={handleRegister} 
            />
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default EventDetails;