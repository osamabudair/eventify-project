// ==================== IMPORTS ====================
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Building2, X } from 'lucide-react';
import EmptyState from '../../components/common/EmptyState';
import { EventCardSkeleton } from '../../components/common/Skeletons';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar/Navbar';
import EventCard from '../../components/EventCard/EventCard';
import Footer from '../../components/Footer/Footer';
import {
  getAllEventsApi,
  getEventByIdApi,
  getCategoriesApi,
} from '../../api/axiosInstance';
import './ExploreEvents.css';

// ==================== HELPER FUNCTIONS (Local / Jordan Time) ====================
const DEFAULT_CATEGORIES = [
  { id: 'default-1', name: 'Technology', slug: 'technology' },
  { id: 'default-2', name: 'Sports', slug: 'sports' },
  { id: 'default-3', name: 'Arts & Culture', slug: 'arts-culture' },
  { id: 'default-4', name: 'Business', slug: 'business' },
  { id: 'default-5', name: 'Social Meetups', slug: 'social-meetups' },
  { id: 'default-6', name: 'Art', slug: 'art' },
  { id: 'default-7', name: 'Science', slug: 'science' },
  { id: 'default-8', name: 'Entertainment', slug: 'entertainment' },
  { id: 'default-9', name: 'Volunteering', slug: 'volunteering' },
  { id: 'default-10', name: 'Health', slug: 'health' },
  { id: 'default-11', name: 'Other', slug: 'other' },
];

// Parses date values regardless of backend format into { y, m, d } in local calendar terms
const parseDateParts = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    const [y, m = 1, d = 1] = dateVal;
    return { y: Number(y), m: Number(m) - 1, d: Number(d) };
  }
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('T')[0].split('-');
    if (parts[0].length === 4) {
      return { y: parseInt(parts[0], 10), m: parseInt(parts[1], 10) - 1, d: parseInt(parts[2], 10) };
    }
    if (parts.length === 3) {
      return { y: parseInt(parts[2], 10), m: parseInt(parts[1], 10) - 1, d: parseInt(parts[0], 10) };
    }
  }
  const dt = new Date(dateVal);
  if (isNaN(dt.getTime())) return null;
  return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() };
};

// Converts "08:30 PM", "20:30", or [20, 30] into { h, min }
const parseTimeParts = (timeVal) => {
  if (!timeVal || timeVal === 'TBA') return null;
  if (Array.isArray(timeVal)) {
    const [h = 23, min = 59] = timeVal;
    return { h: Number(h), min: Number(min) };
  }
  if (typeof timeVal !== 'string') return null;
  const isPM = /pm/i.test(timeVal);
  const isAM = /am/i.test(timeVal);
  const parts = timeVal.replace(/(am|pm)/gi, '').trim().split(':');
  let h = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10) || 0;
  if (isNaN(h)) return null;
  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return { h, min };
};

const getLocalToday = () => {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
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
  const [categoryList, setCategoryList] = useState(DEFAULT_CATEGORIES);

  if (categoryParam !== prevCategoryParam) {
    setPrevCategoryParam(categoryParam);
    setSelectedCategory(categoryParam);
  }
  const [selectedClub, setSelectedClub] = useState('All');
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Explore Events - Eventify';
    window.scrollTo(0, 0);

    let isMounted = true;

    const loadCategories = async () => {
      try {
        const data = await getCategoriesApi();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mergedMap = new Map();
          data.forEach((c) => {
            if (c?.name) {
              mergedMap.set(c.name.toLowerCase(), {
                id: c.id || c.name,
                name: c.name,
                slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              });
            }
          });
          DEFAULT_CATEGORIES.forEach((c) => {
            if (!mergedMap.has(c.name.toLowerCase())) {
              mergedMap.set(c.name.toLowerCase(), c);
            }
          });
          setCategoryList(Array.from(mergedMap.values()));
        }
      } catch {
        // Retain default categories when endpoint is offline
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await getAllEventsApi();
        const today = getLocalToday();
        const now = new Date();

        const checks = await Promise.all(
          (res.data || []).map(async (ev) => {
            const dateParts = parseDateParts(ev.date);
            if (!dateParts) return null;

            const dayDiff = compareDay(dateParts, today);
            if (dayDiff < 0) return null;
            if (dayDiff > 0) return ev;

            // Event is scheduled for today: check endTime in local time so it remains active until finished
            let endTime = ev.endTime;
            if (!endTime && typeof ev.time === 'string' && ev.time.includes('-')) {
              endTime = ev.time.split('-')[1]?.trim();
            }

            if (!endTime) {
              try {
                const details = await getEventByIdApi(ev.id);
                endTime = details.data?.endTime;
              } catch {
                return ev;
              }
            }

            const t = parseTimeParts(endTime) || { h: 23, min: 59 };
            const eventEndLocal = new Date(dateParts.y, dateParts.m, dateParts.d, t.h, t.min, 59, 999);

            return now.getTime() <= eventEndLocal.getTime() ? ev : null;
          })
        );

        const validEvents = checks.filter(Boolean).map((ev) => ({
          id: ev.id,
          title: ev.name || ev.title,
          club: ev.organizerName || ev.organizer?.username || 'Community Club',
          date: ev.date,
          category: ev.category,
          categorySlug:
            ev.categoryEntity?.slug ||
            (ev.category || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tags: [ev.category],
          capacity: Number(ev.capacity ?? ev.maxAttendees ?? ev.maxSeats ?? 20),
          registeredCount: Number(
            ev.registeredCount ?? ev.approvedAttendees ?? ev.approvedCount ?? 0
          ),
          remainingSeats:
            ev.remainingSeats !== undefined ? Number(ev.remainingSeats) : undefined,
          image:
            ev.imageUrl ||
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
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

    loadCategories();
    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const clubs = ['All', ...new Set(allEvents.map((e) => e.club))];

  const matchesSelectedCategory = (event, selected) => {
    if (!selected || selected === 'All') return true;
    const evCat = (event.category || '').toLowerCase();
    const evSlug = (event.categorySlug || '').toLowerCase();
    const selLower = selected.toLowerCase();
    if (evCat === selLower || evSlug === selLower) return true;
    if (selLower === 'arts & culture' && evCat === 'art') return true;
    if (selLower === 'art' && evCat === 'arts & culture') return true;
    return false;
  };

  const filteredEvents = allEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = matchesSelectedCategory(event, selectedCategory);
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
              <button
                className={`filter-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                All
              </button>
              {categoryList.map((cat) => (
                <button
                  key={cat.id || cat.slug || cat.name}
                  className={`filter-pill ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                    selectedCategory.toLowerCase() === (cat.slug || '').toLowerCase()
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {cat.name}
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
                {clubs
                  .filter((c) => c !== 'All')
                  .map((club) => (
                    <option key={club} value={club}>
                      {club}
                    </option>
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
            {filteredEvents.map((event) => (
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
