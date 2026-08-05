import React, { useState, useEffect } from 'react';
import { Search, Filter, CalendarX, Building2, X, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';
import { getAllEventsApi } from '../../api/axiosInstance'; // 👈 استيراد دالة الـ API
import './ExploreEvents.css';

const ExploreEvents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedClub, setSelectedClub] = useState('All');
  
  // 👈 إضافة State للفعاليات الحقيقية وحالة التحميل
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Explore Events - Eventify";
    window.scrollTo(0, 0);

    // 👈 دالة جلب الفعاليات من الباك إند
    const fetchEvents = async () => {
      try {
        const res = await getAllEventsApi();
        
        // تنسيق البيانات الجاية من الداتا بيس عشان تطابق تصميمك
        const formattedEvents = res.data.map(ev => ({
          id: ev._id,
          title: ev.title,
          club: ev.organizer?.username || "University Club", 
          // تحويل التاريخ لصيغة مقروءة
          date: new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          category: ev.category,
          tags: [ev.category], // استخدمنا التصنيف كـ Tag مؤقتاً
          // صورة افتراضية بما إنه لسا ما ضفنا رفع صور بالباك إند
          image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800" 
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

  const categories = ['All', 'Technology', 'Business', 'Sports', 'Art', 'Science', 'Other']; // 👈 عدلتهم ليطابقوا الباك إند
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
        {/* 👈 إضافة شكل تحميل ناعم أثناء جلب البيانات */}
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