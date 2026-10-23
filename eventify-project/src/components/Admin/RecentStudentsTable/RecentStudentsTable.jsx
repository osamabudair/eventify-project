import './RecentStudentsTable.css';
import React, { useMemo } from 'react';
import {
  GraduationCap,
  UserX,
  UserCheck,
  X,
} from 'lucide-react';

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

const RecentStudentsTable = ({
  students = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onSuspend,
  onCancel,
  actionLoadingId = null,
  onViewAll,
  maxItems = 3,
}) => {
  // Parse date safely to timestamp for accurate newest-first ordering
  const getTime = (dateVal) => {
    if (!dateVal) return 0;
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second).getTime();
    }
    const t = new Date(dateVal).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Get the most recently signed-up students (latest 3 students, newest first)
  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => getTime(b?.createdAt) - getTime(a?.createdAt))
      .slice(0, maxItems);
  }, [students, maxItems]);

  return (
    <div className="admin-section-card admin-section-card-spaced">
      <div className="admin-section-header">
        <div className="header-title-box">
          <h3 className="section-heading">Recent Registered Members</h3>
          <p className="section-sub">
            Recently enrolled community participants, account verification status, and registration records.
          </p>
        </div>
        {onViewAll && (
          <button className="view-all-link-btn" onClick={onViewAll}>
            <span>View All Members</span>
          </button>
        )}
      </div>

      <div className="table-container">
        {recentStudents.length === 0 ? (
          <div className="admin-empty-state">
            <GraduationCap size={44} className="empty-icon" />
            <h4>No Registered Students</h4>
            <p>Student registration submissions will be summarized here once created.</p>
          </div>
        ) : (
          /* Exactly matching RegisteredStudentsTable column structure */
          <table className="events-table admin-table students-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Signed Up Date</th>
                <th>Account Status</th>
                <th className="action-col-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((student) => {
                const isProcessing = actionLoadingId === student.id;
                const isSuspended = student.approved === false;
                const avatarSrc = getAvatarForUser(student);

                return (
                  <tr key={student.id} className="admin-table-row">
                    <td className="cell-title">
                      <div className="applicant-cell">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={student.name || 'Student'}
                            className="admin-user-avatar-thumb"
                          />
                        ) : (
                          <div
                            className={`applicant-avatar student-avatar ${isSuspended ? 'avatar-suspended' : ''}`}
                          >
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                        )}
                        <div className="applicant-details">
                          <span className="applicant-name">{student.name}</span>
                          <span className="applicant-id">ID: #{student.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="cell-meta" data-label="Email">
                      <span className="email-text">{student.email}</span>
                    </td>

                    <td className="cell-meta" data-label="Signed Up Date">
                      <div className="date-cell">
                        <span className="date-main">{formatDate(student.createdAt)}</span>
                        {formatExactTime(student.createdAt) && (
                          <span className="date-exact-time">
                            {formatExactTime(student.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="cell-status">
                      {isSuspended ? (
                        <span className="status-indicator status-suspended">
                          Suspended
                        </span>
                      ) : (
                        <span className="status-indicator status-approved">
                          Active Student
                        </span>
                      )}
                    </td>

                    <td className="action-col-cell cell-actions">
                      <div className="admin-row-actions">
                        {isSuspended ? (
                          <button
                            className="btn-action-accept"
                            onClick={() => onSuspend && onSuspend(student.id, student.name, false)}
                            disabled={isProcessing}
                            title="Restore student account access"
                          >
                            <UserCheck size={15} />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            className="btn-action-remove btn-action-suspend"
                            onClick={() => onSuspend && onSuspend(student.id, student.name, true)}
                            disabled={isProcessing}
                            title="Suspend suspicious student account"
                          >
                            <UserX size={15} />
                            <span>Suspend</span>
                          </button>
                        )}

                        <button
                          className="btn-action-remove btn-action-cancel"
                          onClick={() => onCancel && onCancel(student.id, student.name)}
                          disabled={isProcessing}
                          title="Permanently cancel and remove student"
                        >
                          <X size={15} />
                          <span>Cancel</span>
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

export default RecentStudentsTable;
