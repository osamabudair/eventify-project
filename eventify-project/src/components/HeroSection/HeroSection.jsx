// --- Imports ---
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ featuredSampleEvent }) => {
  const navigate = useNavigate();

  const sample = featuredSampleEvent || {
    id: 'explore',
    title: 'Community Tech & Innovation Gala',
    date: 'October 28, 2026',
    club: 'Innovation & Tech Society',
    registeredCount: 0,
    capacity: 20,
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  };

  const capacity = Number(sample.capacity ?? sample.maxSeats ?? sample.maxAttendees ?? 20);
  const registered = Number(sample.registeredCount ?? sample.approvedAttendees ?? sample.approvedCount ?? sample.attendees ?? sample.registrations?.length ?? 0);
  const seatsLeft = (sample.remainingSeats !== undefined && sample.remainingSeats !== null)
    ? Number(sample.remainingSeats)
    : Math.max(0, capacity - registered);

  return (
    <header className="hero-editorial-section animate-slide-up">
      <div className="hero-split-grid">
        {/* Left Column: Natural Headline, Subtitle, and Clean CTAs */}
        <div className="hero-editorial-left">
          <h1 className="hero-editorial-headline">
            Where interesting things happen.
          </h1>

          <p className="hero-editorial-subtitle">
            From weekend workshops and tech meetups to sports games and social gatherings. Eventify makes it easy to discover what’s happening around you or host your own.
          </p>

          <div className="hero-editorial-ctas">
            <button className="primary-btn hero-main-cta" onClick={() => navigate('/explore')}>
              Explore All Events
            </button>
            <button className="secondary-btn hero-ghost-cta" onClick={() => navigate('/auth')}>
              Host an Event
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Elevated Showcase Card */}
        <div className="hero-editorial-right">
          <div 
            className="hero-showcase-card"
            onClick={() => navigate(sample.id !== 'explore' ? `/event/${sample.id}` : '/explore')}
          >
            <div className="showcase-image-viewport">
              <img src={sample.image} alt={sample.title} className="showcase-cover-image" />
              <div className="showcase-overlay" />
              {sample.category && (
                <span className="showcase-category-pill">{sample.category}</span>
              )}
            </div>

            <div className="showcase-details">
              <div className="showcase-meta-chips">
                <span className="showcase-chip">
                  <Calendar size={13} /> {sample.date}
                </span>
                <span className="showcase-chip">
                  <Users size={13} /> {registered} Registered
                </span>
              </div>

              <h3 className="showcase-title">{sample.title}</h3>
              <p className="showcase-club">Hosted by {sample.club}</p>

              <div className="showcase-footer-row">
                <span className="showcase-seats-note">
                  {`${seatsLeft} seats left`}
                </span>
                <span className="showcase-action-link">
                  View Gathering
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;