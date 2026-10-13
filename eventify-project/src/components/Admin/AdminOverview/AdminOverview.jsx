import React from 'react';
import { Clock, UserCheck, GraduationCap, Users } from 'lucide-react';
import StatCard from '../../StatCard';
import RoleDistributionTable from '../RoleDistributionTable/RoleDistributionTable';
import RecentLeadersTable from '../RecentLeadersTable/RecentLeadersTable';
import RecentStudentsTable from '../RecentStudentsTable/RecentStudentsTable';
import './AdminOverview.css';

const AdminOverview = ({
  stats = {},
  allLeaders = [],
  students = [],
  setActiveTab,
  formatDate = () => 'N/A',
  formatExactTime = () => '',
  onApprove,
  onReject,
  onSuspend,
  onCancel,
  actionLoadingId = null,
}) => {
  return (
    <div className="admin-tab-content">
      {/* Stat Cards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Pending Requests"
          value={(stats?.pendingLeadersCount ?? 0).toString()}
          icon={<Clock size={24} className="stat-icon-amber" />}
        />
        <StatCard
          title="Approved Leaders"
          value={(stats?.approvedLeadersCount ?? 0).toString()}
          icon={<UserCheck size={24} className="stat-icon-green" />}
        />
        <StatCard
          title="Total Students"
          value={(stats?.totalStudentsCount ?? 0).toString()}
          icon={<GraduationCap size={24} className="stat-icon-blue" />}
        />
        <StatCard
          title="Total Users"
          value={(stats?.totalUsersCount ?? 0).toString()}
          icon={<Users size={24} className="stat-icon-purple" />}
        />
      </div>

      {/* Table 1: Account & Role Distribution */}
      <RoleDistributionTable stats={stats} />

      {/* Table 2: Recent Leaders Submissions */}
      <RecentLeadersTable
        allLeaders={allLeaders}
        formatDate={formatDate}
        formatExactTime={formatExactTime}
        onApprove={onApprove}
        onReject={onReject}
        actionLoadingId={actionLoadingId}
        onViewAll={() => setActiveTab && setActiveTab('all-leaders')}
      />

      {/* Table 3: Recent Registered Students (Exact same columns as RegisteredStudentsTable) */}
      <RecentStudentsTable
        students={students}
        formatDate={formatDate}
        formatExactTime={formatExactTime}
        onSuspend={onSuspend}
        onCancel={onCancel}
        actionLoadingId={actionLoadingId}
        onViewAll={() => setActiveTab && setActiveTab('students')}
        maxItems={5}
      />
    </div>
  );
};

export default AdminOverview;
