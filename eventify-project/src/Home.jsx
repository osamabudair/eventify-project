import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const mockEvents = [
    {
      id: 1,
      title: "AI Fundamentals Workshop",
      club: "Tech Club",
      date: "July 15, 2026",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800",
      tags: ["Tech", "Coding"]
    },
    {
      id: 2,
      title: "University Chess Championship",
      club: "Cultural Club",
      date: "July 20, 2026",
      image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=800",
      tags: ["Tournament", "Culture"]
    },
    {
      id: 3,
      title: "Blood Donation Drive",
      club: "Volunteer Club",
      date: "July 25, 2026",
      image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=800",
      tags: ["Volunteer", "Health"]
    }
  ];

  return (
    <div className="home-container">
      
      {/* Navbar */}
      <nav className="navbar">
        {/* تم تغيير الاسم وتلوين المقطع الأخير ليعطي شكل لوجو احترافي */}
        <h1 className="logo">Event<span>ify</span></h1>
        <div className="nav-actions">
          <button 
            className="theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button className="login-btn">Log In</button>
          <button className="register-btn">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h2>Discover & Join <br /><span>The Best Events with Eventify</span></h2>
        <p>Eventify is an all-in-one platform connecting student clubs and activities. Develop your skills, build your network, and live a passionate campus life.</p>
        <div className="hero-buttons">
          <button className="primary-btn">Explore Events</button>
          <button className="secondary-btn">Register Club</button>
        </div>
      </header>

      <section className="events-section">
        <div className="section-header">
          <h3>Upcoming Highlights</h3>
          <p>Don't miss out on these featured activities</p>
        </div>

        <div className="events-grid">
          {mockEvents.map((event) => (
            <div key={event.id} className="event-card">
              <img src={event.image} alt={event.title} className="card-image" />
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
                <button className="details-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;