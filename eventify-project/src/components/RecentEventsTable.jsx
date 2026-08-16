// --- Imports ---
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const RecentEventsTable = ({ events, onEdit, onDelete, onViewAll }) => {
  // --- Main Render ---
  return (
    <div className="table-container">
      
      {/* Table Header */}
      <div className="table-header">
        <h3>Recent Events</h3>
        <button className="view-all-btn" onClick={onViewAll}>
          View All
        </button>
      </div>
      
      {/* Events Table */}
      <table className="events-table">
        
        {/* Table Columns */}
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              
              <td className="font-semibold">{event.name}</td>
              <td>{event.date}</td>
              
              {/* Status Badge */}
              <td>
                <span className={`status-badge ${event.status.toLowerCase()}`}>
                  {event.status}
                </span>
              </td>
              
              {/* Action Buttons */}
              <td>
                <div className="actions-wrapper">
                  {/* Note: Ensure onEdit receives the correct param (event vs event.name) based on your parent component */}
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
  );
};

export default RecentEventsTable;