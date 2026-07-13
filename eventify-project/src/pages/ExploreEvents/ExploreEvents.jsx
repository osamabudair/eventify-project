import React, { useState, useEffect } from 'react';
import { Search, Filter, CalendarX, Building2, X } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';
import './ExploreEvents.css';

const ExploreEvents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');

  useEffect(() => {
    document.title = "Explore Events - Eventify";
    window.scrollTo(0, 0);
  }, []);

  const allEvents = [
    { id: 1, title: "AI Fundamentals Workshop", club: "Tech Club", date: "July 15, 2026", category: "Tech", tags: ["Tech", "AI"], image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "Startup Pitch Deck", club: "Business Club", date: "July 18, 2026", category: "Business", tags: ["Business", "Startup"], image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "Web Dev Bootcamp", club: "Tech Club", date: "July 22, 2026", category: "Tech", tags: ["Coding", "Web"], image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800" },
    { id: 4, title: "Campus Marathon 2026", club: "Sports Club", date: "August 10, 2026", category: "Sports", tags: ["Health", "Running"], image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800" },
    { id: 5, title: "Modern Art Exhibition", club: "Art Club", date: "August 15, 2026", category: "Arts", tags: ["Art", "Exhibition"], image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800" },
    { id: 6, title: "Cybersecurity Panel", club: "Tech Club", date: "August 20, 2026", category: "Tech", tags: ["Security", "Tech"], image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" },
  ];

  const categories = ['All', 'Tech', 'Business', 'Sports', 'Arts'];
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

      {/* header content */}
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
              {/* delete search button */}
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* pills filter category */}
            <div className="modern-pills-container">
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
              {/* club filter */}
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
      
      {/* main content */}
      <main className="explore-main animate-slide-up">
        {filteredEvents.length > 0 ? (
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