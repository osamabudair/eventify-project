import React, { useState } from 'react';
import {
  Users,
  Search,
  X,
} from 'lucide-react';
import './AllLeadersTable.css';

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

const AllLeadersTable = ({
  allLeaders = [],
  formatDate = () => 'Recent',
  formatExactTime = () => '',
  onReject,
  actionLoadingId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter to ONLY include verified/approved leaders (status === 'APPROVED' / approved === true)
  const approvedLeaders = allLeaders.filter((l) => l.approved === true);

  const filteredLeaders = approvedLeaders.filter((leader) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = leader.name?.toLowerCase().includes(query);
    const emailMatch = leader.email?.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  return (
    <div className="admin-tab-content">
      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="header-title-box">
            <h3 className="section-heading">All Club Leaders Directory</h3>
            <p className="section-sub">
              Directory of all registered club leaders, their current authorization status, and account records.
            </p>
          </div>

          {/* Search Filter aligned and balanced */}
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

        <div className="table-container">
          {filteredLeaders.length === 0 ? (
            <div className="admin-empty-state">
              <Users size={48} className="empty-icon" />
              <h4>No Club Leaders Found</h4>
              <p>
                {searchQuery
                  ? 'No club leader matched your search keyword.'
                  : 'There are no registered club leaders in the database yet.'}
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
                  <th>Leader Name</th>
                  <th>Email Address</th>
                  <th>Registered Date</th>
                  <th>Approval Status</th>
                  <th className="action-col-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaders.map((leader) => {
                  const isProcessing = actionLoadingId === leader.id;
                  const avatarSrc = getAvatarForUser(leader);
                  return (
                    <tr key={leader.id}>
                      <td className="cell-title">
                        <div className="applicant-cell">
                          {avatarSrc ? (
                            <img
                              src={avatarSrc}
                              alt={leader.name || 'Leader'}
                              className="admin-user-avatar-thumb"
                            />
                          ) : (
                            <div
                              className={`applicant-avatar ${leader.approved ? 'approved' : 'pending'}`}
                            >
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
                            onClick={() => onReject(leader.id, leader.name)}
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
    </div>
  );
};

export default AllLeadersTable;
