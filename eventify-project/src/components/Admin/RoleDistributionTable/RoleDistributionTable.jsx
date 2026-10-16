import React from 'react';
import { Shield, Users, Clock, GraduationCap, CheckCircle2 } from 'lucide-react';

const RoleDistributionTable = ({ stats = {} }) => {
  const totalUsers = stats?.totalUsersCount || 0;
  const approvedLeaders = stats?.approvedLeadersCount || 0;
  const pendingLeaders = stats?.pendingLeadersCount || 0;
  const totalStudents = stats?.totalStudentsCount || 0;

  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <div className="header-title-box">
          <h3 className="section-heading">
            Account & Role Distribution Summary
          </h3>
          <p className="section-sub">
            Structured overview of registered account tiers, authorization scopes, and active system membership.
          </p>
        </div>
      </div>

      <div className="table-container">
        <table className="events-table admin-table">
          <thead>
            <tr>
              <th>Role Type</th>
              <th>Access Scope</th>
              <th>Total Accounts</th>
              <th>Platform Share</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="cell-title">
                <div className="applicant-cell">
                  <div className="role-avatar admin-role">
                    <Shield size={18} />
                  </div>
                  <div className="applicant-details">
                    <span className="applicant-name">System Administrator</span>
                    <span className="applicant-id">Platform Owner</span>
                  </div>
                </div>
              </td>
              <td className="cell-meta cell-meta-stack" data-label="Access Scope">
                <span className="scope-text">
                  Full management console, leader approvals, and security controls
                </span>
              </td>
              <td className="cell-meta" data-label="Total Accounts">
                <span className="account-count-badge">1 Account</span>
              </td>
              <td className="cell-meta" data-label="Platform Share">
                <span className="share-pill">
                  {totalUsers > 0
                    ? `${Math.max(1, Math.round((1 / totalUsers) * 100))}%`
                    : '100%'}
                </span>
              </td>
              <td className="cell-status">
                <span className="status-badge approved">
                  <CheckCircle2 size={13} /> Active
                </span>
              </td>
            </tr>

            <tr>
              <td className="cell-title">
                <div className="applicant-cell">
                  <div className="role-avatar leader-role">
                    <Users size={18} />
                  </div>
                  <div className="applicant-details">
                    <span className="applicant-name">Approved Club Leaders</span>
                    <span className="applicant-id">Verified Organizers</span>
                  </div>
                </div>
              </td>
              <td className="cell-meta cell-meta-stack" data-label="Access Scope">
                <span className="scope-text">
                  Club dashboard, event publishing, and attendee applications management
                </span>
              </td>
              <td className="cell-meta" data-label="Total Accounts">
                <span className="account-count-badge">
                  {approvedLeaders} Accounts
                </span>
              </td>
              <td className="cell-meta" data-label="Platform Share">
                <span className="share-pill">
                  {totalUsers > 0
                    ? `${Math.round((approvedLeaders / totalUsers) * 100)}%`
                    : '0%'}
                </span>
              </td>
              <td className="cell-status">
                <span className="status-badge approved">
                  <CheckCircle2 size={13} /> Active
                </span>
              </td>
            </tr>

            <tr>
              <td className="cell-title">
                <div className="applicant-cell">
                  <div className="role-avatar pending-role">
                    <Clock size={18} />
                  </div>
                  <div className="applicant-details">
                    <span className="applicant-name">Pending Club Leaders</span>
                    <span className="applicant-id">Awaiting Verification</span>
                  </div>
                </div>
              </td>
              <td className="cell-meta cell-meta-stack" data-label="Access Scope">
                <span className="scope-text">
                  Restricted access until administrator approval and account verification
                </span>
              </td>
              <td className="cell-meta" data-label="Total Accounts">
                <span className="account-count-badge">
                  {pendingLeaders} Accounts
                </span>
              </td>
              <td className="cell-meta" data-label="Platform Share">
                <span className="share-pill">
                  {totalUsers > 0
                    ? `${Math.round((pendingLeaders / totalUsers) * 100)}%`
                    : '0%'}
                </span>
              </td>
              <td className="cell-status">
                <span className="status-badge pending">
                  <Clock size={13} /> Pending
                </span>
              </td>
            </tr>

            <tr>
              <td className="cell-title">
                <div className="applicant-cell">
                  <div className="role-avatar student-role">
                    <GraduationCap size={18} />
                  </div>
                  <div className="applicant-details">
                    <span className="applicant-name">Student Members</span>
                    <span className="applicant-id">Campus Participants</span>
                  </div>
                </div>
              </td>
              <td className="cell-meta cell-meta-stack" data-label="Access Scope">
                <span className="scope-text">
                  Event discovery, registration booking, ticket access, and attendee profile
                </span>
              </td>
              <td className="cell-meta" data-label="Total Accounts">
                <span className="account-count-badge">
                  {totalStudents} Accounts
                </span>
              </td>
              <td className="cell-meta" data-label="Platform Share">
                <span className="share-pill">
                  {totalUsers > 0
                    ? `${Math.round((totalStudents / totalUsers) * 100)}%`
                    : '0%'}
                </span>
              </td>
              <td className="cell-status">
                <span className="status-badge approved">
                  <CheckCircle2 size={13} /> Active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleDistributionTable;

