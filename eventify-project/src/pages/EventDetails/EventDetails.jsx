import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import EventRegistrationCard from '../../components/EventRegistrationCard';
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
      <nav className="details-nav">
        <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={20} /> Back</button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      <div className="event-hero-image animate-fade-in">
        <img src={event.image} alt={event.title} />
        <div className="image-overlay"></div>
      </div>

      <main className="event-main-content animate-slide-up">
        <div className="content-wrapper">
          <div className="event-info">
            <div className="event-tags">
              {event.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
            </div>
            <h1 className="event-title">{event.title}</h1>
            <p className="event-description">{event.description}</p>
          </div>

          {/* استدعاء بطاقة التسجيل كمكون نظيف */}
          <EventRegistrationCard 
            event={event} 
            isRegistered={isRegistered} 
            onRegister={() => setIsRegistered(true)} 
          />
        </div>
      </main>
    </div>
  );
};

export default EventDetails;