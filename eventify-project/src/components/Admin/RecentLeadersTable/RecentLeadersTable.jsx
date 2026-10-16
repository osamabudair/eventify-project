import React from 'react';
import { Users, Clock, CheckCircle2, Check, X, ArrowRight } from 'lucide-react';

const RecentLeadersTable = ({
  allLeaders = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onApprove,
  onReject,
  actionLoadingId = null,
  onViewAll,
}) => {
  const recentLeaders = allLeaders.slice(0, 5);

  return (
    <div className="admin-section-card" style={{ marginTop: '24px' }}>
      <div className="admin-section-header">
        <div className="header-title-box">
          <h3 className="section-heading">Recent Club Leader Submissions</h3>
          <p className="section-sub">
            Recent club organizer applications and their current authorization status.
          </p>
        </div>
        {onViewAll && (
          <button className="view-all-link-btn" onClick={onViewAll}>
            <span>View All Leaders</span>
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      <div className="table-container">
        {recentLeaders.length === 0 ? (
          <div className="admin-empty-state">
            <Users size={44} className="empty-icon" />
            <h4>No Recent Applications</h4>
            <p>New club organizer submissions will appear here once submitted.</p>
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
                        <div
                          className={`applicant-avatar ${leader.approved ? 'approved' : 'pending'}`}
                        >
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
                      {leader.approved ? (
                        <span className="status-badge approved">
                          <CheckCircle2 size={13} /> Approved
                        </span>
                      ) : (
                        <span className="status-badge pending">
                          <Clock size={13} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="action-col-cell cell-actions">
                      <div className="admin-row-actions">
                        {!leader.approved && (
                          <button
                            className="btn-action-accept"
                            onClick={() => onApprove && onApprove(leader.id, leader.name)}
                            disabled={isProcessing}
                            title="Approve this leader"
                          >
                            <Check size={15} />
                            <span>Accept</span>
                          </button>
                        )}
                        <button
                          className="btn-action-remove"
                          onClick={() => onReject && onReject(leader.id, leader.name)}
                          disabled={isProcessing}
                          title={leader.approved ? 'Remove leader' : 'Reject application'}
                        >
                          <X size={15} />
                          <span>{leader.approved ? 'Remove' : 'Reject'}</span>
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

