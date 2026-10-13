import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Ban,
  UserX,
  UserCheck,
  X,
} from 'lucide-react';
import './RegisteredStudentsTable.css';

const RegisteredStudentsTable = ({
  students = [],
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onSuspend,
  onCancel,
  actionLoadingId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first by default

  // Toggle sort order between newest first (desc) and oldest first (asc)
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

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

  // Sort students by date (newest first by default, preserving exact original DB timestamp)
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const dateA = getTime(a?.createdAt);
      const dateB = getTime(b?.createdAt);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredStudents, sortOrder]);

  return (
    <div className="admin-tab-content">
      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="header-title-box">
            <div className="title-with-badge">
              <h3 className="section-heading">Registered Students Directory</h3>
              <span className="count-pill">{students.length} Total</span>
            </div>
            <p className="section-sub">
              Complete directory of all registered campus students, account verification details, and enrollment records.
            </p>
          </div>

          <div className="table-controls-group">
            {/* Sort Toggle Button */}
            <button
              className="table-sort-toggle-btn"
              onClick={toggleSortOrder}
              title={`Sorted by signup date: ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}. Click to toggle.`}
            >
              {sortOrder === 'desc' ? (
                <>
                  <ArrowDown size={14} className="sort-icon-active" />
                  <span>Newest First</span>
                </>
              ) : (
                <>
                  <ArrowUp size={14} className="sort-icon-active" />
                  <span>Oldest First</span>
                </>
              )}
            </button>

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
                  <th>Student Name</th>
                  <th>Email Address</th>
                  <th
                    className="sortable-header"
                    onClick={toggleSortOrder}
                    title="Click to sort by signup date"
                  >
                    <div className="sortable-header-content">
                      <span>Signed Up Date</span>
                      {sortOrder === 'desc' ? (
                        <ArrowDown size={14} className="sort-indicator active" />
                      ) : (
                        <ArrowUp size={14} className="sort-indicator active" />
                      )}
                    </div>
                  </th>
                  <th>Account Status</th>
                  <th className="action-col-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => {
                  const isProcessing = actionLoadingId === student.id;
                  const isSuspended = student.approved === false;

                  return (
                    <tr key={student.id} className="admin-table-row">
                      {/* Student Name & Avatar */}
                      <td>
                        <div className="applicant-cell">
                          <div className={`applicant-avatar student-avatar ${isSuspended ? 'avatar-suspended' : ''}`}>
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div className="applicant-details">
                            <span className="applicant-name">{student.name}</span>
                            <span className="applicant-id">ID: #{student.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td>
                        <span className="email-text">{student.email}</span>
                      </td>

                      {/* Exact Original Creation Timestamp - No re-render recalculation */}
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

                      {/* Account Status Badge */}
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

                      {/* Action Column: Suspend or Cancel suspicious students */}
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
    </div>
  );
};

export default RegisteredStudentsTable;
