import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  UserX,
  UserCheck,
  X,
} from 'lucide-react';
import './RegisteredStudentsTable.css';

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

const RegisteredStudentsTable = ({
  students = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onSuspend,
  onCancel,
  actionLoadingId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Safe search filter
  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return students;
    return students.filter((student) => {
      const nameMatch = student?.name?.toLowerCase().includes(query) ?? false;
      const emailMatch = student?.email?.toLowerCase().includes(query) ?? false;
      return nameMatch || emailMatch;
    });
  }, [students, searchQuery]);

  // Robust date parser helper (handles ISO string and Jackson array)
  const getTime = (dateVal) => {
    if (!dateVal) return 0;
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second).getTime();
    }
    const t = new Date(dateVal).getTime();
    return isNaN(t) ? 0 : t;
  };

  // Sort students by date (newest first, preserving exact original DB timestamp)
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const dateA = getTime(a?.createdAt);
      const dateB = getTime(b?.createdAt);
      return dateB - dateA;
    });
  }, [filteredStudents]);

  return (
    <div className="admin-tab-content">
      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="header-title-box">
            <h3 className="section-heading">Registered Students Directory</h3>
            <p className="section-sub">
              Complete directory of all registered campus students, account verification details, and enrollment records.
            </p>
          </div>

          <div className="table-controls-group">
            {/* Unified Search Filter */}
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
        </div>

        {/* Responsive Table Container */}
        <div className="table-container">
          {sortedStudents.length === 0 ? (
            <div className="admin-empty-state">
              <GraduationCap size={48} className="empty-icon" />
              <h4>No Students Found</h4>
              <p>
                {searchQuery
                  ? 'No registered student matched your search keyword.'
                  : 'There are no registered students in the system yet.'}
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
            <table className="events-table admin-table students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Signed Up Date</th>
                  <th>Account Status</th>
                  <th className="action-col-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => {
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
                            <div className={`applicant-avatar student-avatar ${isSuspended ? 'avatar-suspended' : ''}`}>
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
    </div>
  );
};

export default RegisteredStudentsTable;
