// --- Imports ---
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { TableRowSkeleton } from '../../../components/common/Skeletons';
import EmptyState from '../../../components/common/EmptyState';
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
      <div className="animate-fade-in modern-view-section">
        <h3 className="section-heading">Pending Registrations</h3>
        <p className="text-secondary section-description">
          Review and approve student applications for your upcoming events.
        </p>
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
              <TableRowSkeleton rows={4} columns={4} />
            </tbody>
          </table>
        </div>
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
        <EmptyState
          icon={CheckCircle}
          title="All caught up!"
          description="There are no pending registrations requiring your review."
          compact
        />
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
                  <td className="font-semibold cell-title cell-title-full">{req.user?.username || 'Unknown Student'}</td>
                  <td className="cell-meta" data-label="Requested Event">{req.event?.title || 'Deleted Event'}</td>
                  <td className="cell-meta" data-label="Applied On">
                    {new Date(req.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', day: 'numeric', year: 'numeric' 
                    })}
                  </td>
                  <td className="cell-actions">
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