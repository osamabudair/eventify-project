import React from 'react';

const CreateEventModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // إذا كانت الحالة false، لا تعرض شيئاً

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Event</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="input-group">
            <label>Event Name</label>
            <input type="text" placeholder="e.g. React Bootcamp" />
          </div>
          <div className="input-group" style={{ marginTop: '16px' }}>
            <label>Date</label>
            <input type="date" />
          </div>
          <button 
            className="primary-btn" 
            style={{ width: '100%', marginTop: '24px' }}
            onClick={() => { alert("Event Created!"); onClose(); }}
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;