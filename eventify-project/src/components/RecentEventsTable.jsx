import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const RecentEventsTable = ({ events, onEdit, onDelete, onViewAll }) => {
  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Recent Events</h3>
        <button className="view-all-btn" onClick={onViewAll}>View All</button>
      </div>
      <table className="events-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td className="font-semibold">{event.name}</td>
              <td>{event.date}</td>
              <td>
                <span className={`status-badge ${event.status.toLowerCase()}`}>
                  {event.status}
                </span>
              </td>
              <td>
                <button className="action-btn edit" onClick={() => onEdit(event.name)}>
                  <Edit size={16} /> Edit
                </button>
                <button className="action-btn delete" onClick={() => onDelete(event.name)}>
                  <Trash2 size={16} /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentEventsTable;