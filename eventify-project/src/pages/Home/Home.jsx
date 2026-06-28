import React from 'react'; // شلنا الـ useState و useEffect
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext'; // استدعاء الثيم العالمي
import './Home.css';

const Home = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
      <nav className="navbar animate-fade-in-down">
        <h1 className="logo">Event<span>ify</span></h1>
        <div className="nav-actions">
          {/* زر تبديل الدارك مود صار يستخدم الدالة العالمية */}
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <button className="login-btn" onClick={() => navigate('/auth')}>Log In</button>
          <button className="register-btn" onClick={() => navigate('/auth')}>Registration</button>
        </div>
      </nav>

      <header className="hero animate-slide-up">
        <h2>Discover & Join <br /><span>The Best Events with Eventify</span></h2>
        <p>An all-in-one platform connecting student clubs and activities. Develop your skills, build your network, and live a passionate campus life.</p>
        <div className="hero-buttons">
          <button className="primary-btn" onClick={() => navigate('/auth')}>Explore Events</button>
          <button className="secondary-btn" onClick={() => navigate('/auth')}>Register Club</button>
        </div>
      </header>

      <section className="events-section">
        <div className="section-header animate-slide-up-delayed">
          <h3>Upcoming Highlights</h3>
          <p>Don't miss out on these featured activities</p>
        </div>

        <div className="events-grid animate-slide-up-delayed-more">
          {mockEvents.map((event) => (
            <div key={event.id} className="event-card">
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