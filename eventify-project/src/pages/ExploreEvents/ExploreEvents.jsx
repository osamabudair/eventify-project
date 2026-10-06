// ==================== IMPORTS ====================
import React, { useState, useEffect } from 'react';
import { Search, CalendarX, Building2, X, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';
import { getAllEventsApi, getEventByIdApi } from '../../api/axiosInstance';
import './ExploreEvents.css';

// ==================== HELPER FUNCTIONS (Jordan Time UTC+3) ====================
const JORDAN_OFFSET_MS = 3 * 60 * 60 * 1000;

// يرجّع مكونات التاريخ { y, m, d } بغض النظر عن صيغة الباك إند
const parseDateParts = (dateVal) => {
  if (!dateVal) return null;
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('T')[0].split('-');
    if (parts[0].length === 4) {
      return { y: parseInt(parts[0], 10), m: parseInt(parts[1], 10) - 1, d: parseInt(parts[2], 10) };
    }
    if (parts.length === 3) {
      return { y: parseInt(parts[2], 10), m: parseInt(parts[1], 10) - 1, d: parseInt(parts[0], 10) };
    }
  }
  const dt = new Date(dateVal); // مثل "October 5, 2026"
  if (isNaN(dt.getTime())) return null;
  return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
};

// يحوّل "08:30 PM" أو "20:30" إلى { h, min }
const parseTimeParts = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const parts = timeStr.replace(/(am|pm)/gi, '').trim().split(':');
  let h = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10) || 0;
  if (isNaN(h)) return null;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return { h, min };
};

// اللحظة الفعلية (timestamp) لتاريخ ووقت بتوقيت الأردن
const toJordanTimestamp = ({ y, m, d }, h = 0, min = 0) =>
  Date.UTC(y, m, d, h, min, 0, 0) - JORDAN_OFFSET_MS;

// تاريخ اليوم حسب توقيت الأردن
const getJordanToday = () => {
  const j = new Date(Date.now() + JORDAN_OFFSET_MS);
  return { y: j.getUTCFullYear(), m: j.getUTCMonth(), d: j.getUTCDate() };
};

const compareDay = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);

// ==================== COMPONENT ====================
const ExploreEvents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Explore Events - Eventify";
    window.scrollTo(0, 0);

    const fetchEvents = async () => {
      try {
        const res = await getAllEventsApi();
        const today = getJordanToday();
        const nowTs = Date.now();

        const checks = await Promise.all((res.data || []).map(async (ev) => {
          const dateParts = parseDateParts(ev.date);
          if (!dateParts) return null;

          const dayDiff = compareDay(dateParts, today);
          if (dayDiff < 0) return null; // يوم سابق => انتهت
          if (dayDiff > 0) return ev;   // يوم قادم => لم تبدأ بعد

          // فعالية اليوم: لازم نعرف وقت البداية (الـ explore ما بيرجعه)
          let startTime = ev.startTime;
          if (!startTime) {
            try {
              const details = await getEventByIdApi(ev.id);
              startTime = details.data?.startTime;
            } catch {
              return null;
            }
          }
          const t = parseTimeParts(startTime);
          if (!t) return null;

          return nowTs < toJordanTimestamp(dateParts, t.h, t.min) ? ev : null;
        }));

        const validEvents = checks
          .filter(Boolean)
          .map(ev => ({
            id: ev.id,
            title: ev.name || ev.title,
            club: ev.organizerName || ev.organizer?.username || "University Club", 
            date: ev.date,
            category: ev.category,
            tags: [ev.category], 
            image: ev.imageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
          }));

        setAllEvents(validEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = [
    'All',
    'Technology',
    'Business',
    'Sports',
    'Art',
    'Science',
    'Entertainment',
    'Volunteering',
    'Health',
    'Other'
  ];

  const clubs = ['All', ...new Set(allEvents.map(e => e.club))];

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesClub = selectedClub === 'All' || event.club === selectedClub;
    
    return matchesSearch && matchesCategory && matchesClub;
  });

  return (
    <div className="explore-page-container">
      <Navbar />

      <header className="explore-header animate-fade-in">
        <div className="explore-header-content">
          <h1>Explore Campus Events</h1>
          <p>Find the perfect activities to build your skills and network.</p>

          <div className="interactive-filter-section">
            <div className="modern-search-bar">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder="Search events or clubs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
            
            <div className="categories-pill-grid">
              {categories.map(category => (
                <button 
                  key={category}
                  className={`filter-pill ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="club-filter-wrapper">
              <Building2 size={18} className="group-icon" />
              <select 
                className="filter-pill select-pill" 
                value={selectedClub} 
                onChange={(e) => setSelectedClub(e.target.value)}
              >
                <option value="All">All Clubs</option>
                {clubs.filter(c => c !== 'All').map(club => (
                  <option key={club} value={club}>{club}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>
      
      <main className="explore-main animate-slide-up">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', color: '#6366f1' }}>
             <Loader2 className="animate-spin" size={48} />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <CalendarX size={64} className="no-results-icon" />
            <h3>No events found</h3>
            <p>We couldn't find any upcoming active events matching your criteria.</p>
            <button className="secondary-btn" onClick={() => {setSearchQuery(''); setSelectedCategory('All'); setSelectedClub('All');}}>
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExploreEvents;