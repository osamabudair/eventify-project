// ==========================================================================
// EVENTIFY ADMIN DASHBOARD - MAIN ORCHESTRATOR COMPONENT
// ==========================================================================
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  getPendingLeadersApi,
  getAllLeadersApi,
  getAllStudentsApi,
  approveLeaderApi,
  rejectLeaderApi,
  suspendStudentApi,
  cancelStudentApi,
  getAdminStatsApi,
} from '../../api/axiosInstance';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import {
  AdminSidebar,
  AdminHeader,
  AdminOverview,
  AllLeadersTable,
  PendingApprovalsTable,
  RegisteredStudentsTable,
} from '../../components/Admin';
import { StatCardSkeleton, TableRowSkeleton } from '../../components/common/Skeletons';
import { useToast } from '../../context/ToastContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Active Tab: 'stats' (Overview & Stats), 'all-leaders', 'students', 'approvals' (Pending Approval)
  const [activeTab, setActiveTab] = useState('stats');

  // Data States
  const [pendingLeaders, setPendingLeaders] = useState([]);
  const [allLeaders, setAllLeaders] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    pendingLeadersCount: 0,
    approvedLeadersCount: 0,
    totalStudentsCount: 0,
    totalUsersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Notification Bell Dropdown
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Universal Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: true,
    onConfirm: () => {},
  });

  // Action Loading tracking
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Global Toast Notifications
  const { toast } = useToast();
  const showToast = (message, type = 'success') => {
    if (toast[type]) {
      toast[type](message);
    } else {
      toast.info(message);
    }
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Dashboard Data Resiliently
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allLeadersRes, statsRes, studentsRes] =
        await Promise.all([
          getPendingLeadersApi().catch((err) => {
            console.error('Failed to fetch pending leaders:', err);
            return { data: [] };
          }),
          getAllLeadersApi().catch((err) => {
            console.error('Failed to fetch all leaders:', err);
            return { data: [] };
          }),
          getAdminStatsApi().catch((err) => {
            console.error('Failed to fetch admin stats:', err);
            return { data: {} };
          }),
          getAllStudentsApi().catch((err) => {
            console.error('Failed to fetch students:', err);
            return { data: [] };
          }),
        ]);

      const pendingData = Array.isArray(pendingRes?.data) ? pendingRes.data : [];
      const allLeadersData = Array.isArray(allLeadersRes?.data) ? allLeadersRes.data : [];
      const statsData = statsRes?.data || {};
      const studentsData = Array.isArray(studentsRes?.data) ? studentsRes.data : [];

      setPendingLeaders(pendingData);
      setAllLeaders(allLeadersData);
      setStudents(studentsData);

      setStats({
        pendingLeadersCount:
          statsData.pendingLeadersCount ?? pendingData.length,
        approvedLeadersCount:
          statsData.approvedLeadersCount ??
          allLeadersData.filter((l) => l.approved).length,
        totalStudentsCount:
          statsData.totalStudentsCount ?? studentsData.length,
        totalUsersCount:
          statsData.totalUsersCount ??
          allLeadersData.length +
            (statsData.totalStudentsCount || studentsData.length || 0) +
            1, // +1 for the Admin account
      });
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      showToast('Failed to load some dashboard data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Admin Approval Panel - Eventify';
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // Approve Leader Handler
  const handleApprove = async (leaderId, leaderName) => {
    setActionLoadingId(leaderId);
    try {
      await approveLeaderApi(leaderId);
      showToast(`Approved ${leaderName || 'Leader'} successfully!`, 'success');

      // Update state locally and re-sync
      setPendingLeaders((prev) => prev.filter((item) => item.id !== leaderId));
      setAllLeaders((prev) =>
        prev.map((item) =>
          item.id === leaderId ? { ...item, approved: true } : item
        )
      );
      setStats((prev) => ({
        ...prev,
        pendingLeadersCount: Math.max(0, prev.pendingLeadersCount - 1),
        approvedLeadersCount: prev.approvedLeadersCount + 1,
      }));
    } catch (err) {
      console.error('Approval error:', err);
      showToast(
        err.response?.data?.message || 'Failed to approve leader request.',
        'error'
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Reject Leader Dialog
  const openRejectDialog = (leaderId, leaderName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Leader Request',
      message: `Are you sure you want to reject the registration request for "${leaderName || 'Leader'}"? This action permanently removes their pending application.`,
      confirmText: 'Yes, Reject Request',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        setActionLoadingId(leaderId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await rejectLeaderApi(leaderId);
          showToast(
            `Rejected registration request for ${leaderName || 'Leader'}.`,
            'info'
          );
          setPendingLeaders((prev) => prev.filter((item) => item.id !== leaderId));
          setAllLeaders((prev) => prev.filter((item) => item.id !== leaderId));
          setStats((prev) => ({
            ...prev,
            pendingLeadersCount: Math.max(0, prev.pendingLeadersCount - 1),
          }));
        } catch (err) {
          console.error('Rejection error:', err);
          showToast(
            err.response?.data?.message || 'Failed to reject leader request.',
            'error'
          );
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  // Open Suspend / Restore Student Dialog
  const openSuspendStudentDialog = (studentId, studentName, shouldSuspend) => {
    if (!shouldSuspend) {
      // Direct restore or confirm
      executeToggleSuspendStudent(studentId, studentName, false);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Suspend Student Account',
      message: `Are you sure you want to suspend "${studentName || 'Student'}"? Their account access and event registrations will be restricted.`,
      confirmText: 'Yes, Suspend Student',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: () => executeToggleSuspendStudent(studentId, studentName, true),
    });
  };

  const executeToggleSuspendStudent = async (studentId, studentName, shouldSuspend) => {
    setActionLoadingId(studentId);
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    try {
      await suspendStudentApi(studentId).catch(() => ({}));
      showToast(
        shouldSuspend
          ? `Suspended student account for "${studentName || 'Student'}".`
          : `Restored active access for student "${studentName || 'Student'}".`,
        shouldSuspend ? 'info' : 'success'
      );

      // Update student approval/suspended status locally
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, approved: !shouldSuspend } : s))
      );
    } catch (err) {
      console.error('Suspend error:', err);
      showToast('Failed to update student account status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Cancel / Delete Suspicious Student Dialog
  const openCancelStudentDialog = (studentId, studentName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Student Account',
      message: `Are you sure you want to permanently cancel and remove suspicious student "${studentName || 'Student'}"? This action cannot be undone.`,
      confirmText: 'Yes, Cancel & Remove',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        setActionLoadingId(studentId);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await cancelStudentApi(studentId).catch(() => ({}));
          showToast(
            `Permanently cancelled and removed suspicious student "${studentName || 'Student'}".`,
            'info'
          );

          // Remove student locally
          setStudents((prev) => prev.filter((s) => s.id !== studentId));
          setStats((prev) => ({
            ...prev,
            totalStudentsCount: Math.max(0, prev.totalStudentsCount - 1),
            totalUsersCount: Math.max(0, prev.totalUsersCount - 1),
          }));
        } catch (err) {
          console.error('Cancel student error:', err);
          showToast('Failed to cancel student account.', 'error');
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  // =========================================================================
  // EXACT TIMESTAMP HELPERS (Preserves original database creation timestamp)
  // =========================================================================
  const parseDateToDateObj = (dateVal) => {
    if (!dateVal) return null;
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = parseDateToDateObj(dateString);
    if (!d) return String(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatExactTime = (dateString) => {
    if (!dateString) return '';
    const d = parseDateToDateObj(dateString);
    if (!d) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatExactTimestamp = (dateString) => {
    if (!dateString) return 'N/A';
    const d = parseDateToDateObj(dateString);
    if (!d) return String(dateString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Dynamic Header Titles
  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'stats':
        return {
          title: 'Dashboard Overview & Platform Stats',
          subtitle: 'Comprehensive snapshot of system users, registration tiers, and recent submissions.',
        };
      case 'all-leaders':
        return {
          title: 'Club Leaders Directory',
          subtitle: 'Directory of all registered club organizers, verification records, and authorizations.',
        };
      case 'students':
        return {
          title: 'Registered Students Directory',
          subtitle: 'Directory of all enrolled campus students with account details and registration dates.',
        };
      case 'approvals':
      default:
        return {
          title: 'Leader Approval Management',
          subtitle: 'Review and verify club leader registration requests to authorize dashboard access.',
        };
    }
  };

  const headerMeta = getHeaderMeta();

  // Render Tab Content
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="admin-skeleton-wrapper">
          <div className="admin-skeleton-grid">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="admin-skeleton-table-card">
            <table className="events-table admin-table">
              <tbody>
                <TableRowSkeleton rows={5} columns={4} />
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'stats':
        return (
          <AdminOverview
            stats={stats}
            allLeaders={allLeaders}
            pendingLeaders={pendingLeaders}
            students={students}
            setActiveTab={setActiveTab}
            formatDate={formatDate}
            formatExactTime={formatExactTime}
            formatExactTimestamp={formatExactTimestamp}
            onApprove={handleApprove}
            onReject={openRejectDialog}
            onSuspend={openSuspendStudentDialog}
            onCancel={openCancelStudentDialog}
            actionLoadingId={actionLoadingId}
          />
        );
      case 'all-leaders':
        return (
          <AllLeadersTable
            allLeaders={allLeaders}
            formatDate={formatDate}
            formatExactTime={formatExactTime}
            onApprove={handleApprove}
            onReject={openRejectDialog}
            actionLoadingId={actionLoadingId}
          />
        );
      case 'students':
        return (
          <RegisteredStudentsTable
            students={students}
            formatDate={formatDate}
            formatExactTime={formatExactTime}
            onSuspend={openSuspendStudentDialog}
            onCancel={openCancelStudentDialog}
            actionLoadingId={actionLoadingId}
          />
        );
      case 'approvals':
      default:
        return (
          <PendingApprovalsTable
            pendingLeaders={pendingLeaders}
            formatDate={formatDate}
            formatExactTime={formatExactTime}
            onApprove={handleApprove}
            onReject={openRejectDialog}
            actionLoadingId={actionLoadingId}
          />
        );
    }
  };

  return (
    <div className="dashboard-layout admin-layout">


      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        leadersCount={allLeaders.length}
        pendingCount={pendingLeaders.length}
        studentsCount={students.length || stats.totalStudentsCount}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-content admin-main-content">
        {/* Top Header */}
        <AdminHeader
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          pendingLeaders={pendingLeaders}
          isBellOpen={isBellOpen}
          setIsBellOpen={setIsBellOpen}
          bellRef={bellRef}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onApprove={handleApprove}
          onReject={openRejectDialog}
          actionLoadingId={actionLoadingId}
          onViewAllPending={() => setActiveTab('approvals')}
          getRelativeTime={formatExactTime}
        />

        {/* Dynamic Tab Content */}
        <div className="animate-fade-in">{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;
