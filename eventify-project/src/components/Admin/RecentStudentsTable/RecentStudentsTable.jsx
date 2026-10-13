import React, { useMemo } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Ban,
  UserX,
  UserCheck,
  X,
  ArrowRight,
} from 'lucide-react';

const RecentStudentsTable = ({
  students = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onSuspend,
  onCancel,
  actionLoadingId = null,
  onViewAll,
  maxItems = 5,
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

  // Get the most recently signed-up students (latest 3-5 students, newest first)
  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => getTime(b?.createdAt) - getTime(a?.createdAt))
      .slice(0, maxItems);
  }, [students, maxItems]);

  return (
    <div className="admin-section-card" style={{ marginTop: '24px' }}>
      <div className="admin-section-header">
        <div className="header-title-box">
          <h3 className="section-heading">Recent Registered Students</h3>
          <p className="section-sub">
            Recently enrolled campus participants, account verification status, and registration records.
          </p>
        </div>
        {onViewAll && (
          <button className="view-all-link-btn" onClick={onViewAll}>
            <span>View All Students</span>
            <ArrowRight size={15} />
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

                return (
                  <tr key={student.id} className="admin-table-row">
                    {/* 1. Student Name & Avatar */}
                    <td>
                      <div className="applicant-cell">
                        <div
                          className={`applicant-avatar student-avatar ${isSuspended ? 'avatar-suspended' : ''}`}
                        >
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="applicant-details">
                          <span className="applicant-name">{student.name}</span>
                          <span className="applicant-id">ID: #{student.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Email Address */}
                    <td>
                      <span className="email-text">{student.email}</span>
                    </td>

                    {/* 3. Signed Up Date (Exact Original Creation Timestamp) */}
                    <td>
                      <div className="date-cell">
                        <span className="date-main">{formatDate(student.createdAt)}</span>
                        {formatExactTime(student.createdAt) && (
                          <span className="date-exact-time">
                            {formatExactTime(student.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Account Status */}
                    <td>
                      {isSuspended ? (
                        <span className="status-badge suspended">
                          <Ban size={13} /> Suspended
                        </span>
                      ) : (
                        <span className="status-badge student-active">
                          <CheckCircle2 size={13} /> Active Student
                        </span>
                      )}
                    </td>

                    {/* 5. Actions (Matching RegisteredStudentsTable buttons & handlers) */}
                    <td className="action-col-cell">
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

