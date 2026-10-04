// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2, Users, Archive, CalendarDays, Lock } from 'lucide-react';
import { getMyEventsApi, deleteEventApi, getEventByIdApi } from '../../../api/axiosInstance';
import CreateEventModal from '../../../components/createEventModel/CreateEventModal';
import EventAttendeesModal from '../../../components/EventAttendeesModal/EventAttendeesModal';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import './ManageEventsTab.css';

const parseEventDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('-');
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? new Date() : d;
};

const parseTimeOnDate = (baseDate, timeStr, defaultHour, defaultMinute) => {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  if (!timeStr) {
    d.setHours(defaultHour, defaultMinute, 0, 0);
    return d;
  }
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const cleaned = timeStr.replace(/(am|pm)/gi, '').trim();
  const parts = cleaned.split(':');

  let hours = parseInt(parts[0], 10) || 0;
  let minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  d.setHours(hours, minutes, 0, 0);
  return d;
};

const getEventDynamicStatus = (event) => {
  if (!event || !event.date) return 'Upcoming';

  const now = new Date();
  const eventBaseDate = parseEventDate(event.date);

  let startStr = event.startTime;
  let endStr = event.endTime;

  if ((!startStr || !endStr) && event.time && event.time.includes('-')) {
    const timeParts = event.time.split('-');
    startStr = startStr || timeParts[0]?.trim();
    endStr = endStr || timeParts[1]?.trim();
  }

  const startDateTime = parseTimeOnDate(eventBaseDate, startStr, 9, 0);
  const endDateTime = parseTimeOnDate(eventBaseDate, endStr, 23, 59);

  if (now < startDateTime) {
    return 'Upcoming';
  } else if (now >= startDateTime && now <= endDateTime) {
    return 'Ongoing';
  } else {
    return 'Completed';
  }
};

const formatDisplayDate = (dateVal) => {
  if (!dateVal) return '';
  const d = parseEventDate(dateVal);
  if (isNaN(d.getTime())) return dateVal;
  return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
};

const ManageEventsTab = ({ showToast }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState('active'); 

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Attendees Modal
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [viewAttendeesEvent, setViewAttendeesEvent] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, eventId: null, eventName: '' });

  const fetchMyEvents = async () => {
    try {
      const res = await getMyEventsApi();
      setEvents(res.data || []);
    } catch (error) {
      console.error("Error fetching my events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleEdit = async (event, e) => {
    e.stopPropagation();
    const status = getEventDynamicStatus(event);
    if (status === 'Completed') {
      if (showToast) showToast("Completed events cannot be edited.", "info");
      return;
    }

    try {
      const eventId = event._id || event.id;
      const res = await getEventByIdApi(eventId);
      setSelectedEvent(res.data);
      setIsEditModalOpen(true);
    } catch {
      setSelectedEvent(event);
      setIsEditModalOpen(true);
    }
  };

  const promptDelete = (eventId, eventName, e) => {
    e.stopPropagation();
    setDeleteConfirm({ isOpen: true, eventId, eventName });
  };

  const executeDelete = async () => {
    const { eventId, eventName } = deleteConfirm;
    setDeleteConfirm({ isOpen: false, eventId: null, eventName: '' });
    try {
      await deleteEventApi(eventId);
      setEvents(prev => prev.filter(event => (event._id || event.id) !== eventId));
      if (showToast) showToast(`"${eventName}" deleted successfully!`, 'success');
    } catch {
      if (showToast) showToast("Failed to delete event", 'error');
    }
  };

  const handleOpenAttendees = (event) => {
    setViewAttendeesEvent(event);
    setIsAttendeesModalOpen(true);
  };

  const displayedEvents = events.filter(ev => {
    const status = getEventDynamicStatus(ev);
    if (viewFilter === 'archived') {
      return status === 'Completed';
    }
    return status !== 'Completed';
  });

  return (
    <div className="animate-fade-in modern-view-section">
      <div className="manage-header-row">
        <div>
          <h3 className="section-heading">Manage All Events</h3>
          <p className="text-secondary section-description">
            Full control over your club's activities. Click any row to view and manage approved attendees.
          </p>
        </div>

        {/* أزرار التبديل للأرشيف */}
        <div className="archive-toggle-group">
          <button
            className={`archive-toggle-btn ${viewFilter === 'active' ? 'active' : ''}`}
            onClick={() => setViewFilter('active')}
          >
            <CalendarDays size={16} /> Active Events
          </button>
          <button
            className={`archive-toggle-btn ${viewFilter === 'archived' ? 'active' : ''}`}
            onClick={() => setViewFilter('archived')}
          >
            <Archive size={16} /> Archived
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : displayedEvents.length > 0 ? (
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
              {displayedEvents.map((event) => {
                const eventId = event._id || event.id;
                const eventName = event.name || event.title;
                const formattedDate = formatDisplayDate(event.date);

                const attendeesCount = event.approvedAttendees ?? event.approvedCount ?? (Array.isArray(event.attendees) ? event.attendees.length : event.attendees) ?? 0;
                const maxCapacity = event.capacity || event.maxAttendees || 0;
                const dynamicStatus = getEventDynamicStatus(event);
                const isCompleted = dynamicStatus === 'Completed';

                return (
                  <tr
                    key={eventId}
                    className="clickable-event-row"
                    onClick={() => handleOpenAttendees(event)}
                    title="Click to view and manage approved attendees"
                  >
                    <td className="font-semibold">{eventName}</td>
                    <td>{formattedDate}</td>
                    <td>
                      <span className="attendees-badge-click">
                        <Users size={14} /> {attendeesCount} / {maxCapacity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${dynamicStatus.toLowerCase()}`}>
                        {dynamicStatus}
                      </span>
                    </td>
                    <td>
                      <div className="actions-wrapper">
                        {isCompleted ? (
                          <span className="action-disabled-tag" title="Completed event is locked">
                            <Lock size={14} /> Locked
                          </span>
                        ) : (
                          <button className="action-btn edit" onClick={(e) => handleEdit(event, e)}> 
                            <Edit size={16} /> Edit
                          </button>
                        )}
                        <button className="action-btn delete" onClick={(e) => promptDelete(eventId, eventName, e)}>
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
        <div className="empty-state-container">
          <p>{viewFilter === 'archived' ? 'No completed events in the archive.' : 'No active events currently.'}</p>
        </div>
      )}

      <CreateEventModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setTimeout(() => setSelectedEvent(null), 300); 
        }} 
        eventData={selectedEvent} 
        showToast={showToast}
        onEventUpdated={() => {
          fetchMyEvents();
        }}
      />

      <EventAttendeesModal
        isOpen={isAttendeesModalOpen}
        onClose={() => {
          setIsAttendeesModalOpen(false);
          setViewAttendeesEvent(null);
        }}
        event={viewAttendeesEvent}
        showToast={showToast}
        onAttendeeRemoved={() => {
          fetchMyEvents();
        }}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Event"
        message={`Are you sure you want to permanently delete "${deleteConfirm.eventName}"?`}
        confirmText="Yes, Delete"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, eventId: null, eventName: '' })}
      />
    </div>
  );
};

export default ManageEventsTab;