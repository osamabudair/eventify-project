import React, { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  GraduationCap,
  Users,
  Search,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import StatCard from '../../StatCard';
import './PendingApprovalsTable.css';

const PendingApprovalsTable = ({
  pendingLeaders = [],
  stats = {},
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
      {/* Stat Cards Grid with Safe Access */}
      <div className="stats-grid">
        <StatCard
          title="Pending Requests"
          value={(stats?.pendingLeadersCount ?? 0).toString()}
          icon={<Clock size={24} className="stat-icon-amber" />}
        />
        <StatCard
          title="Approved Leaders"
          value={(stats?.approvedLeadersCount ?? 0).toString()}
          icon={<CheckCircle2 size={24} className="stat-icon-green" />}
        />
        <StatCard
          title="Registered Students"
          value={(stats?.totalStudentsCount ?? 0).toString()}
          icon={<GraduationCap size={24} className="stat-icon-blue" />}
        />
        <StatCard
          title="Total System Users"
          value={(stats?.totalUsersCount ?? 0).toString()}
          icon={<Users size={24} className="stat-icon-purple" />}
        />
      </div>

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
                  return (
                    <tr key={leader.id} className="admin-table-row">
                      {/* Applicant Name & Avatar */}
                      <td>
                        <div className="applicant-cell">
                          <div className="applicant-avatar">
                            {leader.name ? leader.name.charAt(0).toUpperCase() : 'L'}
                          </div>
                          <div className="applicant-details">
                            <span className="applicant-name">{leader.name}</span>
                            <span className="applicant-id">ID: #{leader.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span className="email-text">{leader.email}</span>
                      </td>

                      {/* Role */}
                      <td>
                        <span className="role-tag leader">Club Leader</span>
                      </td>

                      {/* Exact Original Creation Timestamp - No re-render recalculation */}
                      <td>
                        <div className="date-cell">
                          <span className="date-main">{formatDate(leader.createdAt)}</span>
                          {formatExactTime(leader.createdAt) && (
                            <span className="date-exact-time">
                              {formatExactTime(leader.createdAt)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge: Shows only "Pending" */}
                      <td>
                        <span className="status-badge pending">
                          <Clock size={13} /> Pending
                        </span>
                      </td>

                      {/* Action Buttons: Centered, clean, borderless */}
                      <td className="action-col-cell">
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
