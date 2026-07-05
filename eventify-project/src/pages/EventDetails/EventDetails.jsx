import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Sun, Moon, CheckCircle } from 'lucide-react';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  // حالة التفاعل لزر التسجيل
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    document.title = `Event Details - Eventify`;
    window.scrollTo(0, 0); // الصعود لأعلى الصفحة عند فتحها
  }, [id]);

  // بيانات وهمية للفعالية (سيتم جلبها لاحقاً من الـ Backend باستخدام الـ id)
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

  const handleRegister = () => {
    // محاكاة عملية التسجيل
    setIsRegistered(true);
  };

  return (
    <div className="event-details-page">
      
      {/* شريط التنقل العلوي البسيط */}
      <nav className="details-nav">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </nav>

      {/* صورة الغلاف الواسعة */}
      <div className="event-hero-image animate-fade-in">
        <img src={event.image} alt={event.title} />
        <div className="image-overlay"></div>
      </div>

      {/* المحتوى الرئيسي (تخطيط واسع ومريح) */}
      <main className="event-main-content animate-slide-up">
        <div className="content-wrapper">
          
          {/* العمود الأيسر: الوصف التفصيلي */}
          <div className="event-info">
            <div className="event-tags">
              {event.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
            <h1 className="event-title">{event.title}</h1>
            <p className="event-description">{event.description}</p>
          </div>

          {/* العمود الأيمن: بطاقة معلومات التسجيل */}
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

            {/* الزر التفاعلي للتسجيل */}
            <button 
              className={`register-action-btn ${isRegistered ? 'registered' : ''}`}
              onClick={handleRegister}
              disabled={isRegistered}
            >
              {isRegistered ? (
                <><CheckCircle size={20} /> Registered Successfully</>
              ) : (
                'Register Now'
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EventDetails;