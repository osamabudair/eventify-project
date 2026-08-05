import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { getMyEventsApi, deleteEventApi } from '../../../api/axiosInstance';
import './ManageEventsTab.css';

const ManageEventsTab = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const res = await getMyEventsApi();
        setEvents(res.data);
      } catch (error) {
        console.error("Error fetching my events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const handleEdit = (eventName) => alert(`Editing event: ${eventName}`);
  const handleDelete = async (eventId, eventName) => {
  if (window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
    try {
      await deleteEventApi(eventId);
      // تحديث القائمة محلياً لحذف العنصر من الشاشة فوراً
      setEvents(events.filter(event => event._id !== eventId));
      alert("Event deleted successfully!");
    } catch {
      alert("Failed to delete event");
    }
  }
};

  return (
    <div className="animate-fade-in modern-view-section">
      <h3 className="section-heading">Manage All Events</h3>
      <p className="text-secondary" style={{ marginBottom: '24px' }}>
        Full control over your club's activities. Edit details or remove canceled events.
      </p>
      
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#6366f1' }}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : events.length > 0 ? (
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
            {events.map((event) => {
              const eventDate = new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              
              // تحديد حالة الفعالية بناءً على التاريخ
              const isPast = new Date(event.date) < new Date();
              const status = isPast ? 'Completed' : 'Active';
              
              return (
                <tr key={event._id}>
                  <td className="font-semibold">{event.title}</td>
                  <td>{eventDate}</td>
                  <td>{event.attendees?.length || 0} / {event.maxAttendees}</td>
                  <td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td>
                  <td>
                    <button className="action-btn edit" onClick={() => handleEdit(event.title)}>
                      <Edit size={16} /> Edit
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(event._id, event.title)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p>You haven't created any events yet.</p>
        </div>
      )}
    </div>
  );
};

export default ManageEventsTab;