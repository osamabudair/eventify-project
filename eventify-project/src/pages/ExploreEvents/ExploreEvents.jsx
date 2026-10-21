// ==================== IMPORTS ====================
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CalendarX, Building2, X } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { EventCardSkeleton } from '../../components/common/Skeletons';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';
import Footer from '../../components/Footer/Footer';
import { getAllEventsApi, getEventByIdApi } from '../../api/axiosInstance';
import './ExploreEvents.css';

// ==================== HELPER FUNCTIONS (Jordan Time UTC+3) ====================
const JORDAN_OFFSET_MS = 3 * 60 * 60 * 1000;

// Parses date values regardless of backend format into { y, m, d }
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
  const dt = new Date(dateVal); // e.g., "October 5, 2026"
  if (isNaN(dt.getTime())) return null;
  return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
};

// Converts "08:30 PM" or "20:30" string format into { h, min }
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

// Returns UTC timestamp for a given date and time components adjusted for Jordan Time (UTC+3)
const toJordanTimestamp = ({ y, m, d }, h = 0, min = 0) =>
  Date.UTC(y, m, d, h, min, 0, 0) - JORDAN_OFFSET_MS;

// Returns today's date in Jordan time zone (UTC+3)
const getJordanToday = () => {
  const j = new Date(Date.now() + JORDAN_OFFSET_MS);
  return { y: j.getUTCFullYear(), m: j.getUTCMonth(), d: j.getUTCDate() };
};

const compareDay = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);

// ==================== COMPONENT ====================
const ExploreEvents = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [prevCategoryParam, setPrevCategoryParam] = useState(categoryParam);

  // Keep the filter in sync when the URL category changes (e.g. footer links clicked while on this page)
  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategory(categoryParam);
  }
  const [selectedClub, setSelectedClub] = useState('All');
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Explore Events - Eventify";
    window.scrollTo(0, 0);

    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const res = await getAllEventsApi();
        const today = getJordanToday();
        const nowTs = Date.now();

        const checks = await Promise.all((res.data || []).map(async (ev) => {
          const dateParts = parseDateParts(ev.date);
          if (!dateParts) return null;

          const dayDiff = compareDay(dateParts, today);
          if (dayDiff < 0) return null; // Past day -> Event completed
          if (dayDiff > 0) return ev;   // Future day -> Event is upcoming

          // Event is today: determine start time
          let startTime = ev.startTime;
          if (!startTime && ev.time && ev.time.includes('-')) {
            startTime = ev.time.split('-')[0]?.trim();
          }

          if (!startTime) {
            try {
              const details = await getEventByIdApi(ev.id);
              startTime = details.data?.startTime;
            } catch {
              return ev; // Keep event visible if detail lookup fails
            }
          }

          const t = parseTimeParts(startTime);
          if (!t) return ev;

          return nowTs < toJordanTimestamp(dateParts, t.h, t.min) ? ev : null;
        }));

        const validEvents = checks
          .filter(Boolean)
          .map(ev => ({
            id: ev.id,
            title: ev.name || ev.title,
            club: ev.organizerName || ev.organizer?.username || "Community Club", 
            date: ev.date,
            category: ev.category,
            tags: [ev.category], 
            capacity: Number(ev.capacity ?? ev.maxAttendees ?? ev.maxSeats ?? 20),
            registeredCount: Number(ev.registeredCount ?? ev.approvedAttendees ?? ev.approvedCount ?? 0),
            remainingSeats: ev.remainingSeats !== undefined ? Number(ev.remainingSeats) : undefined,
            image: ev.imageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
          }));

        if (isMounted) {
          setAllEvents(validEvents);
        }
      } catch {
        if (isMounted) {
          setAllEvents([]);
          toast.error('Unable to load events. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
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
          <div className="events-grid">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={24} />}
            title="No events match your criteria"
            description="Try resetting your filters or searching with different keywords."
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedClub('All');
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ExploreEvents;