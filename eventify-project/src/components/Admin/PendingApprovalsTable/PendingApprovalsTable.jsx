import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import './PendingApprovalsTable.css';

const getAvatarForUser = (user) => {
  if (!user) return null;
  return (
    user.avatarUrl ||
    user.profileImageUrl ||
    user.avatar ||
    user.profilePicture ||
    localStorage.getItem(`avatar_${user.id || user._id || user.email}`) ||
    null
  );
};

const PendingApprovalsTable = ({
  pendingLeaders = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onApprove,
  onReject,
  actionLoadingId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Safe search filter
  const filteredPending = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return pendingLeaders;
    return pendingLeaders.filter((leader) => {
      const nameMatch = leader?.name?.toLowerCase().includes(query) ?? false;
      const emailMatch = leader?.email?.toLowerCase().includes(query) ?? false;
      return nameMatch || emailMatch;
    });
  }, [pendingLeaders, searchQuery]);

  return (
    <div className="admin-tab-content">
      {/* Approval Management Section */}
      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="header-title-box">
            <h3 className="section-heading">Pending Leader Registrations</h3>
            <p className="section-sub">
              Review requests from club leaders awaiting authorization. Approved leaders can immediately access the Club Dashboard.
            </p>
          </div>

          <div className="admin-search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table of Pending Leaders */}
        <div className="table-container">
          {filteredPending.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon-wrapper">
                <ShieldCheck size={52} className="shield-icon" />
              </div>
              <h4>No Pending Approval Requests</h4>
              <p>
                {searchQuery
                  ? 'No pending leader matched your search keyword.'
                  : 'All club leaders have been processed. New leader registrations will appear here for review.'}
              </p>
              {searchQuery && (
                <button
                  className="reset-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <table className="events-table admin-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th className="action-col-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((leader) => {
                  const isProcessing = actionLoadingId === leader.id;
                  const avatarSrc = getAvatarForUser(leader);
                  return (
                    <tr key={leader.id} className="admin-table-row">
                      <td className="cell-title">
                        <div className="applicant-cell">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={leader.name || 'Leader'}
                              className="admin-user-avatar-thumb"
                            />
                          ) : (
                            <div className="applicant-avatar">
                              {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                            </div>
                          )}
                          <div className="applicant-details">
                            <span className="applicant-name">{leader.name}</span>
                            <span className="applicant-id">ID: #{leader.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="cell-meta" data-label="Email">
                        <span className="email-text">{leader.email}</span>
                      </td>

                      <td className="cell-meta" data-label="Role">
                        <span className="role-text">Club Leader</span>
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
    </div>
  );
};

export default PendingApprovalsTable;
