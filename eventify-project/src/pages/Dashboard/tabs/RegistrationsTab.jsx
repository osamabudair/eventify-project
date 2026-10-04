// --- Imports ---
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getOrganizerRegistrationsApi, updateRegistrationStatusApi } from '../../../api/axiosInstance';
import './RegistrationsTab.css';

const RegistrationsTab = ({ showToast }) => {
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
      if (showToast) showToast(`Approved registration for ${name}`, 'success');
    } catch {
      if (showToast) showToast(`Failed to approve registration for ${name}`, 'error');
    }
  };

  const handleRejectRequest = async (id, name) => {
    try {
      await updateRegistrationStatusApi(id, 'rejected');
      setPendingRequests(pendingRequests.filter(req => req._id !== id));
      if (showToast) showToast(`Rejected registration for ${name}`, 'info');
    } catch {
      if (showToast) showToast(`Failed to reject registration for ${name}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="modern-view-section loading-container">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in modern-view-section">
      <h3 className="section-heading">Pending Registrations</h3>
      <p className="text-secondary section-description">
        Review and approve student applications for your upcoming events.
      </p>

      {pendingRequests.length === 0 ? (
        <div className="empty-state-container">
          <CheckCircle size={48} className="empty-icon" />
          <p>All caught up! No pending requests.</p>
        </div>
      ) : (
        <div className="table-responsive">
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
              {pendingRequests.map((req, index) => (
                <tr key={req._id || req.id || index}>
                  <td className="font-semibold">{req.user?.username || 'Unknown Student'}</td>
                  <td>{req.event?.title || 'Deleted Event'}</td>
                  <td>
                    {new Date(req.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </td>
                  <td>
                    <div className="actions-wrapper">
                      <button className="action-btn approve" onClick={() => handleApproveRequest(req._id, req.user?.username)}>
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button className="action-btn reject" onClick={() => handleRejectRequest(req._id, req.user?.username)}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegistrationsTab;