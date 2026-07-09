import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import HeroSection from '../../components/HeroSection/HeroSection';
import EventCard from '../../components/EventCard/EventCard'; 
import './Home.css';

const Home = () => {
  useEffect(() => { document.title = "Home - Eventify"; }, []);

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
      <Navbar />
      <HeroSection />
      
      <section className="events-section">
        <div className="section-header animate-slide-up-delayed">
          <h3>Upcoming Highlights</h3>
          <p>Don't miss out on these featured activities</p>
        </div>
        <div className="events-grid animate-slide-up-delayed-more">
          {mockEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;