import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import EventRegistrationCard from '../../components/EventRegistrationCard/EventRegistrationCard';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    document.title = `Event Details - Eventify`;
    window.scrollTo(0, 0);
  }, [id]);

  const event = {
    id: id,
    title: "AI Fundamentals Workshop",
    club: "Tech Club",
    date: "July 15, 2026",
    time: "10:00 AM - 02:00 PM",
    location: "Main Campus, Hall A",
    capacity: "120 Attendees",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=1400",
    description: "Join us for an in-depth workshop on the fundamentals of Artificial Intelligence. We will cover the basics of machine learning, neural networks, and real-world applications. This interactive session is perfect for beginners and tech enthusiasts looking to expand their knowledge and build their network. Please bring your laptops as there will be hands-on coding exercises.",
    tags: ["Tech", "Coding", "AI", "Workshop"]
  };

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
              <p>Don't miss out on this opportunity to connect with like-minded individuals and advance your technical career.</p>
            </div>
          </div>

          {/* Event Registration Card */}
          <div className="event-sidebar">
            <EventRegistrationCard 
              event={event} 
              isRegistered={isRegistered} 
              onRegister={() => setIsRegistered(true)} 
            />
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default EventDetails;