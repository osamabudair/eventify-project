import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const RecentEventsTable = ({ events, onEdit, onDelete, onViewAll }) => {
  return (
    <div className="table-container">
      <div className="table-header">
        <h3>Recent Events</h3>
        <button className="view-all-btn" onClick={onViewAll}>
          View All
        </button>
      </div>
      
      <div className="table-responsive">
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
                <td className="font-semibold cell-title">{event.name}</td>
                <td className="cell-meta" data-label="Date">{event.date}</td>
                <td className="cell-status">
                  <span className={`status-badge ${event.status.toLowerCase()}`}>
                    {event.status}
                  </span>
                </td>
                <td className="cell-actions">
                  <div className="actions-wrapper">
                    <button className="action-btn edit" onClick={() => onEdit(event.name)}>
                      <Edit size={16} /> Edit
                    </button>
                    <button className="action-btn delete" onClick={() => onDelete(event.id, event.name)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentEventsTable;