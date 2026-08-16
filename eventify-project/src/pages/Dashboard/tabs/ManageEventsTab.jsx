// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { getMyEventsApi, deleteEventApi } from '../../../api/axiosInstance';
import CreateEventModal from '../../../components/createEventModel/CreateEventModal';
import './ManageEventsTab.css';

const ManageEventsTab = () => {
  // --- State Management ---
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- Side Effects ---
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

  // --- Handlers ---
  const handleEdit = (event) => {
    setIsEditModalOpen(true); 
    setTimeout(() => { setSelectedEvent(event); }, 50); 
  };
  
  const handleDelete = async (eventId, eventName) => {
    if (window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      try {
        await deleteEventApi(eventId);
        setEvents(events.filter(event => event._id !== eventId));
        alert("Event deleted successfully!");
      } catch {
        alert("Failed to delete event");
      }
    }
  };

  // --- Render ---
  return (
    <div className="animate-fade-in modern-view-section">
      
      {/* --- Header Section --- */}
      <h3 className="section-heading">Manage All Events</h3>
      <p className="text-secondary section-description">
        Full control over your club's activities. Edit details or remove canceled events.
      </p>
      
      {/* --- Content Area --- */}
      {isLoading ? (
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : events.length > 0 ? (
        
        /* Events Table */
        <div className="table-responsive">
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
                
                const isPast = new Date(event.date) < new Date();
                const status = isPast ? 'Completed' : 'Active';
                
                return (
                  <tr key={event._id}>
                    <td className="font-semibold">{event.title}</td>
                    <td>{eventDate}</td>
                    <td>{event.attendees?.length || 0} / {event.maxAttendees}</td>
                    <td><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></td>
                    <td>
                      <div className="actions-wrapper">
                        <button className="action-btn edit" onClick={() => handleEdit(event)}> 
                          <Edit size={16} /> Edit
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(event._id, event.title)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        
        /* Empty State */
        <div className="empty-state-container">
          <p>You haven't created any events yet.</p>
        </div>
      )}

      <CreateEventModal 
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false);
            setTimeout(() => setSelectedEvent(null), 300); 
          }} 
          eventData={selectedEvent} 
          onEventUpdated={() => {
            getMyEventsApi().then(res => setEvents(res.data)).catch(err => console.error(err));
          }}
        />
    </div>
  );
};

export default ManageEventsTab;