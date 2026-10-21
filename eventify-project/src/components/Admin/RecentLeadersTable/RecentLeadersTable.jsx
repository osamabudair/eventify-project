import './RecentLeadersTable.css';
import React from 'react';
import { Users, X } from 'lucide-react';

const RecentLeadersTable = ({
  allLeaders = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onReject,
  actionLoadingId = null,
  onViewAll,
}) => {
  // Display ONLY the latest 3 approved club leaders (status === 'APPROVED' or leader.approved === true)
  const approvedLeaders = allLeaders.filter((l) => l.approved === true);
  const recentLeaders = approvedLeaders.slice(0, 3);

  return (
    <div className="admin-section-card admin-section-card-spaced">
      <div className="admin-section-header">
        <div className="header-title-box">
          <h3 className="section-heading">Recent Approved Club Leaders</h3>
          <p className="section-sub">
            Verified club organizers authorized to manage events and community registrations.
          </p>
        </div>
        {onViewAll && (
          <button className="view-all-link-btn" onClick={onViewAll}>
            <span>View All Leaders</span>
          </button>
        )}
      </div>

      <div className="table-container">
        {recentLeaders.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={44} className="empty-icon" />
            <h4>No Approved Leaders</h4>
            <p>Verified club organizers will appear here once approved.</p>
          </div>
        ) : (
          <table className="events-table admin-table">
            <thead>
              <tr>
                <th>Leader Name</th>
                <th>Email Address</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th className="action-col-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaders.map((leader) => {
                const isProcessing = actionLoadingId === leader.id;
                return (
                  <tr key={leader.id}>
                    <td className="cell-title">
                      <div className="applicant-cell">
                        <div className="applicant-avatar approved">
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
                    <td className="cell-meta" data-label="Registered Date">
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
                      <span className="status-indicator status-approved">
                        Approved
                      </span>
                    </td>
                    <td className="action-col-cell cell-actions">
                      <div className="admin-row-actions">
                        <button
                          className="btn-action-remove"
                          onClick={() => onReject && onReject(leader.id, leader.name)}
                          disabled={isProcessing}
                          title="Remove leader"
                        >
                          <X size={15} />
                          <span>Remove</span>
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

export default RecentLeadersTable;

