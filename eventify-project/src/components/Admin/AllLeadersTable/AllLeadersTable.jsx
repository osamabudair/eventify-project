import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Check,
  X,
} from 'lucide-react';
import './AllLeadersTable.css';

const AllLeadersTable = ({
  allLeaders = [],
  formatDate = () => 'Recent',
  formatExactTime = () => '',
  onApprove,
  onReject,
  actionLoadingId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeaders = allLeaders.filter((leader) => {
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
                              onClick={() => onApprove(leader.id, leader.name)}
                              disabled={isProcessing}
                              title="Approve leader"
                            >
                              <Check size={15} />
                              <span>Accept</span>
                            </button>
                          )}
                          <button
                            className="btn-action-remove"
                            onClick={() => onReject(leader.id, leader.name)}
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
    </div>
  );
};

export default AllLeadersTable;

