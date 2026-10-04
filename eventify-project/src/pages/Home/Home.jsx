// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import HeroSection from '../../components/HeroSection/HeroSection';
import EventCard from '../../components/EventCard/EventCard'; 
import { getUpcomingHighlightsApi } from '../../api/axiosInstance';
import './Home.css';

const Home = () => {
  // --- State Management ---
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Side Effects ---
  useEffect(() => { 
    document.title = "Home - Eventify"; 
    
    const fetchRecentEvents = async () => {
      try {
        const res = await getUpcomingHighlightsApi();
        
        const recent = res.data.map(ev => ({
          id: ev.id,
          title: ev.name,
          club: ev.organizerName || "University Club",
          date: ev.date, 
          image: ev.imageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
          tags: [ev.category]
        }));

        setFeaturedEvents(recent);
      } catch (error) {
        console.error("Error fetching home events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  // --- Render ---
  return (
    <div className="home-container">
      <Navbar />
      <HeroSection />
      
      <section className="events-section">
        <div className="section-header animate-slide-up-delayed">
          <h3>Upcoming Highlights</h3>
          <p>Don't miss out on these featured activities</p>
        </div>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#6366f1' }}>
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : (
          <div className="events-grid animate-slide-up-delayed-more">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;