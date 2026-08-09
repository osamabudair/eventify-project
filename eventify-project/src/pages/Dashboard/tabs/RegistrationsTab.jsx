import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getOrganizerRegistrationsApi, updateRegistrationStatusApi } from '../../../api/axiosInstance';
import './RegistrationsTab.css';

const RegistrationsTab = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      const res = await getOrganizerRegistrationsApi();
      const onlyPending = res.data.filter(reg => reg.status === 'pending');
      setPendingRequests(onlyPending);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (id, name) => {
    try {
      await updateRegistrationStatusApi(id, 'approved');
      setPendingRequests(pendingRequests.filter(req => req._id !== id));
      alert(`Approved registration for ${name}`);
    } catch{
      alert(`Failed to approve registration for ${name}`);
    }
  };

  const handleRejectRequest = async (id, name) => {
    try {
      await updateRegistrationStatusApi(id, 'rejected');
      setPendingRequests(pendingRequests.filter(req => req._id !== id));
      alert(`Rejected registration for ${name}`);
    } catch{
      alert(`Failed to reject registration for ${name}`);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in modern-view-section" style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-color)' }} />
      </div>
    );
  }

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
              <tr key={req._id}>
                <td className="font-semibold">{req.user?.username || 'Unknown Student'}</td>
                <td>{req.event?.title || 'Deleted Event'}</td>
                <td>
                  {new Date(req.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric' 
                  })}
                </td>
                <td>
                  <button className="action-btn approve" onClick={() => handleApproveRequest(req._id, req.user?.username)}>
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button className="action-btn reject" onClick={() => handleRejectRequest(req._id, req.user?.username)}>
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