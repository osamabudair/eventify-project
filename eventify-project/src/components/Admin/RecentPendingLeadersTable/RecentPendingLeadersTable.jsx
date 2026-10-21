import './RecentPendingLeadersTable.css';
import React from 'react';
import { Clock, Check, X } from 'lucide-react';

const RecentPendingLeadersTable = ({
  pendingLeaders = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onApprove,
  onReject,
  actionLoadingId = null,
  onViewAll,
}) => {
  // Display ONLY the latest 3 pending leader registrations (status === 'PENDING')
  const recentPending = pendingLeaders.slice(0, 3);

  return (
    <div className="admin-section-card admin-section-card-spaced">
      <div className="admin-section-header">
        <div className="header-title-box">
          <h3 className="section-heading">Recent Pending Leader Applications</h3>
          <p className="section-sub">
            Latest organizer registration requests awaiting verification and approval.
          </p>
        </div>
        {onViewAll && (
          <button className="view-all-link-btn" onClick={onViewAll}>
            <span>View All Pending</span>
          </button>
        )}
      </div>

      <div className="table-container">
        {recentPending.length === 0 ? (
          <div className="admin-empty-state">
            <Clock size={44} className="empty-icon" />
            <h4>No Pending Applications</h4>
            <p>All leader registrations have been verified and processed.</p>
          </div>
        ) : (
          <table className="events-table admin-table">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Email Address</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th className="action-col-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPending.map((leader) => {
                const isProcessing = actionLoadingId === leader.id;
                return (
                  <tr key={leader.id}>
                    <td className="cell-title">
                      <div className="applicant-cell">
                        <div className="applicant-avatar pending">
                          {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                        </div>
                        <div className="applicant-details">
                          <span className="applicant-name">{leader.name}</span>
                          <span className="applicant-id">ID: #{leader.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="cell-meta" data-label="Email">
                      <span className="email-text">{leader.email}</span>
                    </td>
                    <td className="cell-meta" data-label="Submitted Date">
                      <div className="date-cell">
                        <span className="date-main">{formatDate(leader.createdAt)}</span>
                        {formatExactTime(leader.createdAt) && (
                          <span className="date-exact-time">
                            {formatExactTime(leader.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="cell-status">
                      <span className="status-indicator status-pending">
                        Pending
                      </span>
                    </td>
                    <td className="action-col-cell cell-actions">
                      <div className="admin-row-actions">
                        <button
                          className="btn-action-accept"
                          onClick={() => onApprove && onApprove(leader.id, leader.name)}
                          disabled={isProcessing}
                          title="Approve this leader"
                        >
                          <Check size={15} />
                          <span>Accept</span>
                        </button>
                        <button
                          className="btn-action-reject"
                          onClick={() => onReject && onReject(leader.id, leader.name)}
                          disabled={isProcessing}
                          title="Reject registration"
                        >
                          <X size={15} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecentPendingLeadersTable;

