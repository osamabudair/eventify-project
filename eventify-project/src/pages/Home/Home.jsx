// ==================== IMPORTS ====================
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import HeroSection from '../../components/HeroSection/HeroSection';
import EventCard from '../../components/EventCard/EventCard'; 
import Footer from '../../components/Footer/Footer';
import { getAllEventsApi } from '../../api/axiosInstance';
import './Home.css';

// ==================== HELPER FUNCTIONS ====================
const parseEventDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('-');
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? new Date() : d;
};

const parseTimeOnDate = (baseDate, timeStr, defaultHour, defaultMinute) => {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  if (!timeStr) {
    d.setHours(defaultHour, defaultMinute, 0, 0);
    return d;
  }
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const cleaned = timeStr.replace(/(am|pm)/gi, '').trim();
  const parts = cleaned.split(':');

  let hours = parseInt(parts[0], 10) || 0;
  let minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  d.setHours(hours, minutes, 0, 0);
  return d;
};

const isEventStartedOrFinished = (event) => {
  if (!event || !event.date) return false;
  const now = new Date();
  const eventBaseDate = parseEventDate(event.date);

  let startStr = event.startTime;
  if (!startStr && event.time && event.time.includes('-')) {
    startStr = event.time.split('-')[0]?.trim();
  }

  const startDateTime = parseTimeOnDate(eventBaseDate, startStr, 9, 0);
  return now >= startDateTime;
};

// Check if an event has already ended (end date/time is in the past)
const isEventEnded = (event) => {
  if (!event) return false;
  const eventDateVal = event.endDate || event.date;
  if (!eventDateVal) return false;

  const now = new Date();
  const eventBaseDate = parseEventDate(eventDateVal);

  let endStr = event.endTime;
  if (!endStr && event.time && event.time.includes('-')) {
    const timeParts = event.time.split('-');
    endStr = timeParts[1]?.trim();
  }

  // End date time: default to 23:59 (end of day) if no specific end time is provided
  const endDateTime = parseTimeOnDate(eventBaseDate, endStr, 23, 59);
  return now > endDateTime;
};

// ==================== COMPONENT ====================
const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    document.title = "Home - Eventify"; 
    
    const fetchRecentEvents = async () => {
      try {
        const res = await getAllEventsApi();
        const allEvents = res.data || [];
        
        // Check if user is an unauthenticated guest
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        const isGuest = !token || !userString;

        // When a guest visits, filter out events that have already ended
        const visibleEvents = isGuest
          ? allEvents.filter(ev => !isEventEnded(ev))
          : allEvents;

        // القادمة أولاً (الأقرب فالأقرب)، وإذا أقل من 3 بنكمّل من باقي الفعاليات عشان يضلوا 3 دايماً
        const upcoming = visibleEvents
          .filter(ev => !isEventStartedOrFinished(ev))
          .sort((a, b) => parseEventDate(a.date) - parseEventDate(b.date));
        const others = visibleEvents
          .filter(ev => isEventStartedOrFinished(ev))
          .sort((a, b) => parseEventDate(b.date) - parseEventDate(a.date));

        const upcomingSorted = [...upcoming, ...others]
          .slice(0, 3)
          .map(ev => ({
            id: ev.id,
            title: ev.name || ev.title,
            club: ev.organizerName || ev.organizer?.name || "University Club",
            date: ev.date, 
            image: ev.imageUrl || ev.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
            tags: [ev.category || "General"]
          }));

        setFeaturedEvents(upcomingSorted);
      } catch (error) {
        console.error("Error fetching home events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentEvents();
  }, []);

  return (
    <>
    <div className="home-container">
      <Navbar />
      <HeroSection />
      
      <section className="events-section">
        <div className="section-header animate-slide-up-delayed">
          <h3>Upcoming Highlights</h3>
          <p>Don't miss out on these featured activities</p>
        </div>
        
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--primary-color)' }}>
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
    <Footer />
    </>
  );
};

export default Home;