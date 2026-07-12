import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import './ManageEventsTab.css';

const ManageEventsTab = () => {
  const recentEvents = [
    { id: 1, name: 'AI Fundamentals Workshop', date: 'July 15, 2026', status: 'Active' },
    { id: 2, name: 'Web Dev Bootcamp', date: 'July 22, 2026', status: 'Draft' },
    { id: 3, name: 'Cybersecurity Panel', date: 'August 05, 2026', status: 'Active' },
  ];

  const handleEdit = (eventName) => alert(`Editing event: ${eventName}`);
  const handleDelete = (eventName) => {
    if(window.confirm(`Are you sure you want to delete "${eventName}"?`)) alert("Event deleted!");
  };

  return (
    <div className="animate-fade-in modern-view-section">
      <h3 className="section-heading">Manage All Events</h3>
      <p className="text-secondary" style={{ marginBottom: '24px' }}>
        Full control over your club's activities. Edit details or remove canceled events.
      </p>
      <table className="events-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Attendees</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recentEvents.map((event) => (
            <tr key={event.id}>
              <td className="font-semibold">{event.name}</td>
              <td>{event.date}</td>
              <td>{Math.floor(Math.random() * 100) + 20} / 120</td>
              <td><span className={`status-badge ${event.status.toLowerCase()}`}>{event.status}</span></td>
              <td>
                <button className="action-btn edit" onClick={() => handleEdit(event.name)}><Edit size={16} /> Edit</button>
                <button className="action-btn delete" onClick={() => handleDelete(event.name)}><Trash2 size={16} /> Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageEventsTab;