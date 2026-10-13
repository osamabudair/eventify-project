// --- Imports ---
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Compass,
  LogIn,
  Cpu,
  Briefcase,
  Trophy,
  HeartHandshake,
  Mail,
  Lock,
} from 'lucide-react';
import './Footer.css';

// --- Static Content ---
const SUPPORT_EMAIL = 'support@eventify.edu';
const CURRENT_YEAR = 2026;

const linkIconProps = { size: 15, className: 'footer-link-icon', 'aria-hidden': true };
const tagIconProps = { size: 13, 'aria-hidden': true };

const QUICK_LINKS = [
  { label: 'Home', to: '/', icon: <Home {...linkIconProps} /> },
  { label: 'Explore Events', to: '/explore', icon: <Compass {...linkIconProps} /> },
  { label: 'Login / Register', to: '/auth', icon: <LogIn {...linkIconProps} /> },
];

const CATEGORIES = [
  { label: 'Technology', icon: <Cpu {...tagIconProps} /> },
  { label: 'Business', icon: <Briefcase {...tagIconProps} /> },
  { label: 'Sports', icon: <Trophy {...tagIconProps} /> },
  { label: 'Volunteering', icon: <HeartHandshake {...tagIconProps} /> },
];

const ORGANIZER_LINKS = [
  { label: 'Support Email', href: `mailto:${SUPPORT_EMAIL}`, icon: <Mail {...linkIconProps} /> },
  { label: 'Privacy Policy', to: '/privacy', icon: <Lock {...linkIconProps} /> },
];

// --- Component ---
const Footer = () => {
  return (
    <footer className="site-footer" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="footer-sr-only">Site footer</h2>

      <div className="footer-inner">
        <div className="footer-grid">
          {/* 1. Brand Column */}
          <div className="footer-col footer-brand">
            <Link to="/" className="footer-logo" aria-label="Eventify home">
              Event<span>ify</span>
              <span className="footer-logo-dot" aria-hidden="true" />
            </Link>
            <p className="footer-tagline">
              Your premier campus platform to discover, organize, and attend
              university events seamlessly.
            </p>
            <p className="footer-copyright">
              © {CURRENT_YEAR} Eventify. All rights reserved.
            </p>
          </div>

          {/* 2. Quick Links Column */}
          <nav className="footer-col" aria-label="Quick links">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="footer-link">
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 3. Event Categories Column */}
          <nav className="footer-col" aria-label="Event categories">
            <h3 className="footer-heading">Event Categories</h3>
            <ul className="footer-tags">
              {CATEGORIES.map((item) => (
                <li key={item.label}>
                  <Link
                    to={`/explore?category=${encodeURIComponent(item.label)}`}
                    className="footer-tag"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 4. Organizers & Support Column */}
          <nav className="footer-col" aria-label="Organizers and support">
            <h3 className="footer-heading">Organizers &amp; Support</h3>
            <ul className="footer-links">
              {ORGANIZER_LINKS.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} className="footer-link">
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <Link to={item.to} className="footer-link">
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-legal">
            © {CURRENT_YEAR} Eventify · Built for university communities.
          </p>
          <Link to="/privacy" className="footer-privacy-link">
            <Lock size={14} aria-hidden="true" />
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

