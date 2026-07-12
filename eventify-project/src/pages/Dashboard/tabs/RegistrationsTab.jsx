import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import './RegistrationsTab.css';

const RegistrationsTab = () => {
  const [pendingRequests, setPendingRequests] = useState([
    { id: 101, student: 'Ahmad Ali', event: 'AI Fundamentals Workshop', date: 'July 10, 2026' },
    { id: 102, student: 'Sara Khaled', event: 'Web Dev Bootcamp', date: 'July 11, 2026' },
    { id: 103, student: 'Omar Sami', event: 'Cybersecurity Panel', date: 'July 12, 2026' },
  ]);

  const handleApproveRequest = (id, name) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== id));
    alert(`Approved registration for ${name}`);
  };

  const handleRejectRequest = (id, name) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== id));
    alert(`Rejected registration for ${name}`);
  };

  return (
    <div className="animate-fade-in modern-view-section">
      <h3 className="section-heading">Pending Registrations</h3>
      <p className="text-secondary" style={{ marginBottom: '24px' }}>
        Review and approve student applications for your upcoming events.
      </p>
      
      {pendingRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <CheckCircle size={48} style={{ opacity: 0.5, margin: '0 auto 16px auto' }} />
          <p>All caught up! No pending requests.</p>
        </div>
      ) : (
        <table className="events-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Requested Event</th>
              <th>Applied On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((req) => (
              <tr key={req.id}>
                <td className="font-semibold">{req.student}</td>
                <td>{req.event}</td>
                <td>{req.date}</td>
                <td>
                  <button className="action-btn approve" onClick={() => handleApproveRequest(req.id, req.student)}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="action-btn reject" onClick={() => handleRejectRequest(req.id, req.student)}>
                    <XCircle size={16} /> Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RegistrationsTab;