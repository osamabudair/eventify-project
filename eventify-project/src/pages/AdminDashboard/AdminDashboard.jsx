import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Shield,
  Clock,
  CheckCircle2,
  Users,
  GraduationCap,
  Bell,
  Sun,
  Moon,
  Search,
  Check,
  X,
  LogOut,
  AlertCircle,
  Info,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import {
  getPendingLeadersApi,
  getAllLeadersApi,
  approveLeaderApi,
  rejectLeaderApi,
  getAdminStatsApi,
} from "../../api/axiosInstance";
import StatCard from "../../components/StatCard";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Active Tab: Ordered by default: 'stats' (Overview & Stats), 'all-leaders', 'approvals' (Pending Approval)
  const [activeTab, setActiveTab] = useState("stats");

  // Data States
  const [pendingLeaders, setPendingLeaders] = useState([]);
  const [allLeaders, setAllLeaders] = useState([]);
  const [stats, setStats] = useState({
    pendingLeadersCount: 0,
    approvedLeadersCount: 0,
    totalStudentsCount: 0,
    totalUsersCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Notification Bell Dropdown
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Rejection Dialog State
  const [rejectDialog, setRejectDialog] = useState({
    isOpen: false,
    leaderId: null,
    leaderName: "",
  });

  // Action Loading
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Toast Notifications
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Dashboard Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allLeadersRes, statsRes] = await Promise.all([
        getPendingLeadersApi(),
        getAllLeadersApi(),
        getAdminStatsApi(),
      ]);

      const pendingData = pendingRes.data || [];
      const allLeadersData = allLeadersRes.data || [];
      const statsData = statsRes.data || {};

      setPendingLeaders(pendingData);
      setAllLeaders(allLeadersData);
      setStats({
        pendingLeadersCount:
          statsData.pendingLeadersCount ?? pendingData.length,
        approvedLeadersCount:
          statsData.approvedLeadersCount ??
          allLeadersData.filter((l) => l.approved).length,
        totalStudentsCount: statsData.totalStudentsCount ?? 0,
        totalUsersCount:
          statsData.totalUsersCount ??
          allLeadersData.length + (statsData.totalStudentsCount || 0),
      });
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      showToast("Failed to load dashboard data. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Admin Approval Panel - Eventify";
    fetchData();
  }, []);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  // Approve Leader Handler
  const handleApprove = async (leaderId, leaderName) => {
    setActionLoadingId(leaderId);
    try {
      await approveLeaderApi(leaderId);
      showToast(`Approved ${leaderName || "Leader"} successfully!`, "success");

      // Update state locally and re-sync
      setPendingLeaders((prev) => prev.filter((item) => item.id !== leaderId));
      setAllLeaders((prev) =>
        prev.map((item) =>
          item.id === leaderId ? { ...item, approved: true } : item,
        ),
      );
      setStats((prev) => ({
        ...prev,
        pendingLeadersCount: Math.max(0, prev.pendingLeadersCount - 1),
        approvedLeadersCount: prev.approvedLeadersCount + 1,
      }));
    } catch (err) {
      console.error("Approval error:", err);
      showToast(
        err.response?.data?.message || "Failed to approve leader request.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Reject Dialog
  const openRejectDialog = (leaderId, leaderName) => {
    setRejectDialog({
      isOpen: true,
      leaderId,
      leaderName,
    });
  };

  // Execute Rejection
  const handleConfirmReject = async () => {
    const { leaderId, leaderName } = rejectDialog;
    if (!leaderId) return;

    setActionLoadingId(leaderId);
    setRejectDialog({ isOpen: false, leaderId: null, leaderName: "" });

    try {
      await rejectLeaderApi(leaderId);
      showToast(
        `Rejected registration request for ${leaderName || "Leader"}.`,
        "info",
      );

      // Update state locally
      setPendingLeaders((prev) => prev.filter((item) => item.id !== leaderId));
      setAllLeaders((prev) => prev.filter((item) => item.id !== leaderId));
      setStats((prev) => ({
        ...prev,
        pendingLeadersCount: Math.max(0, prev.pendingLeadersCount - 1),
      }));
    } catch (err) {
      console.error("Rejection error:", err);
      showToast(
        err.response?.data?.message || "Failed to reject leader request.",
        "error",
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Relative Time Helper
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Just now";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);
      if (isNaN(diffSec) || diffSec < 60) return "Just now";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  // Filter pending leaders
  const filteredPending = pendingLeaders.filter((leader) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = leader.name?.toLowerCase().includes(query);
    const emailMatch = leader.email?.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  // Filter all leaders
  const filteredAllLeaders = allLeaders.filter((leader) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = leader.name?.toLowerCase().includes(query);
    const emailMatch = leader.email?.toLowerCase().includes(query);
    return nameMatch || emailMatch;
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="dashboard-layout admin-layout">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" && <CheckCircle2 size={18} />}
            {toast.type === "error" && <AlertCircle size={18} />}
            {toast.type === "info" && <Info size={18} />}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={rejectDialog.isOpen}
        title="Reject Leader Request"
        message={`Are you sure you want to reject the registration request for "${rejectDialog.leaderName}"? This action removes their pending application.`}
        confirmText="Yes, Reject Request"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmReject}
        onCancel={() =>
          setRejectDialog({ isOpen: false, leaderId: null, leaderName: "" })
        }
      />

      {/* Sidebar Navigation */}
      <aside className="sidebar admin-sidebar">
        <div className="sidebar-header">
          <h1 className="logo">
            Event<span>ify</span>
          </h1>
          <span className="admin-badge">ADMIN CONSOLE</span>
        </div>

        {/* Sidebar Navigation: Reordered to 1. Overview & Stats, 2. All Club Leaders, 3. Pending Approval */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            <LayoutDashboard size={18} />
            <span>Overview & Stats</span>
            <span className="sidebar-nav-counter">{stats.totalUsersCount}</span>
          </button>

          <button
            className={`nav-item ${activeTab === "all-leaders" ? "active" : ""}`}
            onClick={() => setActiveTab("all-leaders")}
          >
            <Users size={18} />
            <span>All Club Leaders</span>
            <span className="sidebar-nav-counter">{allLeaders.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === "approvals" ? "active" : ""}`}
            onClick={() => setActiveTab("approvals")}
          >
            <Clock size={18} />
            <span>Pending Approval</span>
            <span
              className={`sidebar-nav-counter ${pendingLeaders.length > 0 ? "pending-active" : ""}`}
            >
              {pendingLeaders.length}
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              <Shield size={18} />
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">
                {currentUser.name || "System Admin"}
              </span>
              <span className="admin-user-email">
                {currentUser.email || "admin@eventify.com"}
              </span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content admin-main-content">
        {/* Top Header */}
        <header className="dashboard-header admin-header">
          <div>
            <h2>Leader Approval Management</h2>
            <p className="text-secondary">
              Review and verify club leader registration requests to authorize
              dashboard access.
            </p>
          </div>

          <div className="header-actions">
            {/* Notification Bell (Borderless with modern top-right red notification dot) */}
            <div className="notification-bell-container" ref={bellRef}>
              <button
                className={`theme-toggle bell-btn ${isBellOpen ? "active" : ""}`}
                onClick={() => setIsBellOpen(!isBellOpen)}
                aria-label="Notifications"
                title={
                  pendingLeaders.length > 0
                    ? `${pendingLeaders.length} Pending Approval Notifications`
                    : "Notifications"
                }
              >
                <Bell size={20} />
                {pendingLeaders.length > 0 && (
                  <span className="bell-badge-dot" />
                )}
              </button>

              {/* Notification Dropdown */}
              {isBellOpen && (
                <div className="notifications-dropdown">
                  <div className="notifications-dropdown-header">
                    <div className="dropdown-title-group">
                      <span className="dropdown-title">Pending Approvals</span>
                      <span className="dropdown-counter">
                        {pendingLeaders.length} waiting
                      </span>
                    </div>
                    {pendingLeaders.length > 0 && (
                      <span className="dropdown-status-tag">
                        Action Required
                      </span>
                    )}
                  </div>

                  <div className="notifications-list">
                    {pendingLeaders.length === 0 ? (
                      <div className="empty-notifications">
                        <CheckCircle2 size={32} className="empty-icon" />
                        <p className="empty-title">All Caught Up!</p>
                        <p className="empty-sub">
                          No pending leader registrations at this time.
                        </p>
                      </div>
                    ) : (
                      pendingLeaders.map((leader) => (
                        <div key={leader.id} className="notification-item">
                          <div className="notification-item-avatar">
                            {leader.name
                              ? leader.name.charAt(0).toUpperCase()
                              : "L"}
                          </div>
                          <div className="notification-item-info">
                            <span className="notification-item-name">
                              {leader.name}
                            </span>
                            <span className="notification-item-email">
                              {leader.email}
                            </span>
                            <span className="notification-item-time">
                              <Clock size={12} />{" "}
                              {getRelativeTime(leader.createdAt)}
                            </span>
                          </div>
                          <div className="notification-item-actions">
                            <button
                              className="quick-action-btn accept"
                              onClick={() => {
                                handleApprove(leader.id, leader.name);
                              }}
                              disabled={actionLoadingId === leader.id}
                              title="Accept Leader"
                            >
                              <Check size={15} />
                            </button>
                            <button
                              className="quick-action-btn reject"
                              onClick={() => {
                                openRejectDialog(leader.id, leader.name);
                                setIsBellOpen(false);
                              }}
                              disabled={actionLoadingId === leader.id}
                              title="Reject Leader"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {pendingLeaders.length > 0 && (
                    <div className="notifications-dropdown-footer">
                      <button
                        className="dropdown-view-all-btn"
                        onClick={() => {
                          setActiveTab("approvals");
                          setIsBellOpen(false);
                        }}
                      >
                        Manage All in Table
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Dynamic Content based on Active Tab */}
        <div className="animate-fade-in">
          {/* ================= TAB 1: OVERVIEW & STATS ================= */}
          {activeTab === "stats" && (
            <div className="admin-tab-content">
              {/* Stat Cards Grid */}
              <div className="stats-grid">
                <StatCard
                  title="Pending Requests"
                  value={stats.pendingLeadersCount.toString()}
                  icon={<Clock size={24} className="stat-icon-amber" />}
                />
                <StatCard
                  title="Approved Leaders"
                  value={stats.approvedLeadersCount.toString()}
                  icon={<UserCheck size={24} className="stat-icon-green" />}
                />
                <StatCard
                  title="Total Students"
                  value={stats.totalStudentsCount.toString()}
                  icon={<GraduationCap size={24} className="stat-icon-blue" />}
                />
                <StatCard
                  title="Total Users"
                  value={stats.totalUsersCount.toString()}
                  icon={<Users size={24} className="stat-icon-purple" />}
                />
              </div>

              {/* Table 1: Well-Structured Summary Table replacing old box */}
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div className="header-title-box">
                    <h3 className="section-heading">
                      Account & Role Distribution Summary
                    </h3>
                    <p className="section-sub">
                      Structured overview of registered account tiers,
                      authorization scopes, and active system membership.
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
                        <td>
                          <div className="applicant-cell">
                            <div className="role-avatar admin-role">
                              <Shield size={18} />
                            </div>
                            <div className="applicant-details">
                              <span className="applicant-name">
                                System Administrator
                              </span>
                              <span className="applicant-id">
                                Platform Owner
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="scope-text">
                            Full management console, leader approvals, and
                            security controls
                          </span>
                        </td>
                        <td>
                          <span className="account-count-badge">1 Account</span>
                        </td>
                        <td>
                          <span className="share-pill">
                            {stats.totalUsersCount > 0
                              ? `${Math.max(1, Math.round((1 / stats.totalUsersCount) * 100))}%`
                              : "100%"}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge approved">
                            <CheckCircle2 size={13} /> Active
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <div className="applicant-cell">
                            <div className="role-avatar leader-role">
                              <Users size={18} />
                            </div>
                            <div className="applicant-details">
                              <span className="applicant-name">
                                Approved Club Leaders
                              </span>
                              <span className="applicant-id">
                                Verified Organizers
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="scope-text">
                            Club dashboard, event publishing, and attendee
                            applications management
                          </span>
                        </td>
                        <td>
                          <span className="account-count-badge">
                            {stats.approvedLeadersCount} Accounts
                          </span>
                        </td>
                        <td>
                          <span className="share-pill">
                            {stats.totalUsersCount > 0
                              ? `${Math.round((stats.approvedLeadersCount / stats.totalUsersCount) * 100)}%`
                              : "0%"}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge approved">
                            <CheckCircle2 size={13} /> Active
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <div className="applicant-cell">
                            <div className="role-avatar pending-role">
                              <Clock size={18} />
                            </div>
                            <div className="applicant-details">
                              <span className="applicant-name">
                                Pending Club Leaders
                              </span>
                              <span className="applicant-id">
                                Awaiting Verification
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="scope-text">
                            Restricted access until administrator approval and
                            account verification
                          </span>
                        </td>
                        <td>
                          <span className="account-count-badge">
                            {stats.pendingLeadersCount} Accounts
                          </span>
                        </td>
                        <td>
                          <span className="share-pill">
                            {stats.totalUsersCount > 0
                              ? `${Math.round((stats.pendingLeadersCount / stats.totalUsersCount) * 100)}%`
                              : "0%"}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge pending">
                            <Clock size={13} /> Pending
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <div className="applicant-cell">
                            <div className="role-avatar student-role">
                              <GraduationCap size={18} />
                            </div>
                            <div className="applicant-details">
                              <span className="applicant-name">
                                Student Members
                              </span>
                              <span className="applicant-id">
                                Campus Participants
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="scope-text">
                            Event discovery, registration booking, ticket
                            access, and attendee profile
                          </span>
                        </td>
                        <td>
                          <span className="account-count-badge">
                            {stats.totalStudentsCount} Accounts
                          </span>
                        </td>
                        <td>
                          <span className="share-pill">
                            {stats.totalUsersCount > 0
                              ? `${Math.round((stats.totalStudentsCount / stats.totalUsersCount) * 100)}%`
                              : "0%"}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge approved">
                            <CheckCircle2 size={13} /> Active
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Recent Activity / Latest Leader Applications in Overview */}
              <div className="admin-section-card" style={{ marginTop: "24px" }}>
                <div className="admin-section-header">
                  <div className="header-title-box">
                    <h3 className="section-heading">
                      Recent Club Leader Submissions
                    </h3>
                    <p className="section-sub">
                      Recent club organizer applications and their current
                      authorization status.
                    </p>
                  </div>
                  <button
                    className="view-all-link-btn"
                    onClick={() => setActiveTab("all-leaders")}
                  >
                    <span>View All Leaders</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div className="table-container">
                  {allLeaders.length === 0 ? (
                    <div className="admin-empty-state">
                      <Users size={44} className="empty-icon" />
                      <h4>No Club Leaders Registered</h4>
                      <p>
                        Leader registration submissions will be summarized here
                        once created.
                      </p>
                    </div>
                  ) : (
                    <table className="events-table admin-table">
                      <thead>
                        <tr>
                          <th>Leader Name</th>
                          <th>Email Address</th>
                          <th>Registration Date</th>
                          <th>Approval Status</th>
                          <th className="action-col-header">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allLeaders.slice(0, 5).map((leader) => {
                          const isProcessing = actionLoadingId === leader.id;
                          return (
                            <tr key={leader.id}>
                              <td>
                                <div className="applicant-cell">
                                  <div
                                    className={`applicant-avatar ${leader.approved ? "approved" : "pending"}`}
                                  >
                                    {leader.name
                                      ? leader.name.charAt(0).toUpperCase()
                                      : "L"}
                                  </div>
                                  <div className="applicant-details">
                                    <span className="applicant-name">
                                      {leader.name}
                                    </span>
                                    <span className="applicant-id">
                                      ID: #{leader.id}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="email-text">
                                  {leader.email}
                                </span>
                              </td>
                              <td>
                                <span>{formatDate(leader.createdAt)}</span>
                              </td>
                              <td>
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
                              <td className="action-col-cell">
                                <div className="admin-row-actions">
                                  {!leader.approved && (
                                    <button
                                      className="btn-action-accept"
                                      onClick={() =>
                                        handleApprove(leader.id, leader.name)
                                      }
                                      disabled={isProcessing}
                                      title="Approve this leader"
                                    >
                                      <Check size={15} />
                                      <span>Accept</span>
                                    </button>
                                  )}
                                  <button
                                    className="btn-action-remove"
                                    onClick={() =>
                                      openRejectDialog(leader.id, leader.name)
                                    }
                                    disabled={isProcessing}
                                    title={
                                      leader.approved
                                        ? "Remove leader"
                                        : "Reject application"
                                    }
                                  >
                                    <X size={15} />
                                    <span>
                                      {leader.approved ? "Remove" : "Reject"}
                                    </span>
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
          )}

          {/* ================= TAB 2: ALL CLUB LEADERS ================= */}
          {activeTab === "all-leaders" && (
            <div className="admin-tab-content">
              <div className="admin-section-card">
                <div className="admin-section-header">
                  <div className="header-title-box">
                    <h3 className="section-heading">
                      All Club Leaders Directory
                    </h3>
                    <p className="section-sub">
                      Directory of all registered club leaders, their current
                      authorization status, and account records.
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
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-container">
                  {filteredAllLeaders.length === 0 ? (
                    <div className="admin-empty-state">
                      <Users size={48} className="empty-icon" />
                      <h4>No Club Leaders Found</h4>
                      <p>
                        {searchQuery
                          ? "No club leader matched your search keyword."
                          : "There are no registered club leaders in the database yet."}
                      </p>
                      {searchQuery && (
                        <button
                          className="reset-search-btn"
                          onClick={() => setSearchQuery("")}
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
                        {filteredAllLeaders.map((leader) => {
                          const isProcessing = actionLoadingId === leader.id;
                          return (
                            <tr key={leader.id}>
                              <td>
                                <div className="applicant-cell">
                                  <div
                                    className={`applicant-avatar ${leader.approved ? "approved" : "pending"}`}
                                  >
                                    {leader.name
                                      ? leader.name.charAt(0).toUpperCase()
                                      : "L"}
                                  </div>
                                  <div className="applicant-details">
                                    <span className="applicant-name">
                                      {leader.name}
                                    </span>
                                    <span className="applicant-id">
                                      ID: #{leader.id}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="email-text">
                                  {leader.email}
                                </span>
                              </td>
                              <td>
                                <span>{formatDate(leader.createdAt)}</span>
                              </td>
                              <td>
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
                              <td className="action-col-cell">
                                <div className="admin-row-actions">
                                  {!leader.approved && (
                                    <button
                                      className="btn-action-accept"
                                      onClick={() =>
                                        handleApprove(leader.id, leader.name)
                                      }
                                      disabled={isProcessing}
                                      title="Approve leader"
                                    >
                                      <Check size={15} />
                                      <span>Accept</span>
                                    </button>
                                  )}
                                  <button
                                    className="btn-action-remove"
                                    onClick={() =>
                                      openRejectDialog(leader.id, leader.name)
                                    }
                                    disabled={isProcessing}
                                    title={
                                      leader.approved
                                        ? "Remove leader"
                                        : "Reject application"
                                    }
                                  >
                                    <X size={15} />
                                    <span>
                                      {leader.approved ? "Remove" : "Reject"}
                                    </span>
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
          )}

          {/* ================= TAB 3: PENDING APPROVAL ================= */}
          {activeTab === "approvals" && (
            <div className="admin-tab-content">
              {/* Stat Cards Grid */}
              <div className="stats-grid">
                <StatCard
                  title="Pending Requests"
                  value={stats.pendingLeadersCount.toString()}
                  icon={<Clock size={24} className="stat-icon-amber" />}
                />
                <StatCard
                  title="Approved Leaders"
                  value={stats.approvedLeadersCount.toString()}
                  icon={<CheckCircle2 size={24} className="stat-icon-green" />}
                />
                <StatCard
                  title="Registered Students"
                  value={stats.totalStudentsCount.toString()}
                  icon={<GraduationCap size={24} className="stat-icon-blue" />}
                />
                <StatCard
                  title="Total System Users"
                  value={stats.totalUsersCount.toString()}
                  icon={<Users size={24} className="stat-icon-purple" />}
                />
              </div>

              {/* Approval Management Section */}
              <div className="admin-section-card">
                {/* Section Header with Search Bar moved slightly to the left */}
                <div className="admin-section-header">
                  <div className="header-title-box">
                    <h3 className="section-heading">
                      Pending Leader Registrations
                    </h3>
                    <p className="section-sub">
                      Review requests from club leaders awaiting authorization.
                      Approved leaders can immediately access the Club
                      Dashboard.
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
                        onClick={() => setSearchQuery("")}
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
                          ? "No pending leader matched your search keyword."
                          : "All club leaders have been processed. New leader registrations will appear here for review."}
                      </p>
                      {searchQuery && (
                        <button
                          className="reset-search-btn"
                          onClick={() => setSearchQuery("")}
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
                                    {leader.name
                                      ? leader.name.charAt(0).toUpperCase()
                                      : "L"}
                                  </div>
                                  <div className="applicant-details">
                                    <span className="applicant-name">
                                      {leader.name}
                                    </span>
                                    <span className="applicant-id">
                                      ID: #{leader.id}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td>
                                <span className="email-text">
                                  {leader.email}
                                </span>
                              </td>

                              {/* Role */}
                              <td>
                                <span className="role-tag leader">
                                  Club Leader
                                </span>
                              </td>

                              {/* Date */}
                              <td>
                                <div className="date-cell">
                                  <span>{formatDate(leader.createdAt)}</span>
                                  <span className="date-relative">
                                    {getRelativeTime(leader.createdAt)}
                                  </span>
                                </div>
                              </td>

                              {/* Status Badge: Shows only "Pending" */}
                              <td>
                                <span className="status-badge pending">
                                  <Clock size={13} /> Pending
                                </span>
                              </td>

                              {/* Action Buttons: Redesigned modern, clean, borderless */}
                              <td className="action-col-cell">
                                <div className="admin-row-actions">
                                  <button
                                    className="btn-action-accept"
                                    onClick={() =>
                                      handleApprove(leader.id, leader.name)
                                    }
                                    disabled={isProcessing}
                                    title="Approve this leader"
                                  >
                                    <Check size={15} />
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    className="btn-action-reject"
                                    onClick={() =>
                                      openRejectDialog(leader.id, leader.name)
                                    }
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
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
