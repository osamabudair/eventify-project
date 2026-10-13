// --- Imports ---
import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './PrivacyPolicy.css';

const SECTIONS = [
  {
    title: 'Information We Collect',
    body: 'When you create an Eventify account we collect your name, university email address, and role (student, club leader, or administrator). We also store the events you register for and the events you organize.',
  },
  {
    title: 'How We Use Your Information',
    body: 'Your information is used to manage your account, process event registrations, issue tickets, send event-related notifications, and help administrators keep the platform safe.',
  },
  {
    title: 'Sharing',
    body: 'Event organizers can see the names and emails of students registered for their events. We do not sell or share your personal data with third parties for advertising.',
  },
  {
    title: 'Data Security',
    body: 'Passwords are stored hashed, and access to dashboards is protected by role-based authentication. Suspicious accounts may be suspended by administrators.',
  },
  {
    title: 'Your Choices',
    body: 'You can update your profile details at any time from your dashboard. To request account deletion or a copy of your data, contact our support team.',
  },
];

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy - Eventify';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="privacy-container">
        <Navbar />
        <main className="privacy-main">
          <header className="privacy-header">
            <h1>Privacy Policy</h1>
            <p>Last updated: October 2026</p>
          </header>

          {SECTIONS.map(({ title, body }) => (
            <section key={title} className="privacy-section">
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}

          <section className="privacy-section">
            <h2>Contact</h2>
            <p>
              Questions about this policy? Email us at{' '}
              <a href="mailto:support@eventify.edu">support@eventify.edu</a>.
            </p>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;

