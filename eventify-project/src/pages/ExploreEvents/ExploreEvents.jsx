// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Search, Filter, CalendarX, Building2, X, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';
import { getAllEventsApi } from '../../api/axiosInstance';
import './ExploreEvents.css';

const ExploreEvents = () => {
  // --- State Management ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Side Effects ---
  useEffect(() => {
    document.title = "Explore Events - Eventify";
    window.scrollTo(0, 0);

    const fetchEvents = async () => {
      try {
        const res = await getAllEventsApi();
        
        const formattedEvents = res.data.map(ev => ({
          id: ev._id,
          title: ev.title,
          club: ev.organizer?.username || "University Club", 
          date: new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          category: ev.category,
          tags: [ev.category], 
          image: ev.image 
            ? `http://localhost:5000${ev.image.startsWith('/') ? '' : '/'}${ev.image}` 
            : "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
        }));

        setAllEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // --- Data Filtering & Preparation ---
  const categories = ['All', 'Technology', 'Business', 'Sports', 'Art', 'Science', 'Other'];
  const clubs = ['All', ...new Set(allEvents.map(e => e.club))];

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesClub = selectedClub === 'All' || event.club === selectedClub;
    
    return matchesSearch && matchesCategory && matchesClub;
  });

  // --- Render ---
  return (
    <div className="explore-page-container">
      <Navbar />

      {/* --- Header Section --- */}
      <header className="explore-header animate-fade-in">
        <div className="explore-header-content">
          <h1>Explore Campus Events</h1>
          <p>Find the perfect activities to build your skills and network.</p>

          {/* --- Interactive Filter Section --- */}
          <div className="interactive-filter-section">
            
            {/* Search Bar */}
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
            
            {/* Filter Pills Container */}
            <div className="modern-pills-container">
              
              {/* Category Pills */}
              <div className="pill-group">
                <Filter size={18} className="group-icon" />
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

              <div className="pill-divider"></div>
              
              {/* Club Select Pill */}
              <div className="pill-group">
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
        </div>
      </header>
      
      {/* --- Main Content Section --- */}
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
            <p>We couldn't find any events matching your criteria.</p>
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