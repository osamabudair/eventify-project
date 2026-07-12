import React from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import RecentEventsTable from '../../../components/RecentEventsTable';
import './OverviewTab.css';

const OverviewTab = ({ setActiveTab }) => {
  const stats = [
    { title: 'Total Events', value: '12', icon: <Calendar size={24} /> },
    { title: 'Total Registrations', value: '348', icon: <Users size={24} /> },
    { title: 'Pending Requests', value: '25', icon: <Clock size={24} /> },
  ];

  const recentEvents = [
    { id: 1, name: 'AI Fundamentals Workshop', date: 'July 15, 2026', status: 'Active' },
    { id: 2, name: 'Web Dev Bootcamp', date: 'July 22, 2026', status: 'Draft' },
    { id: 3, name: 'Cybersecurity Panel', date: 'August 05, 2026', status: 'Active' },
  ];

  const handleEdit = (eventName) => alert(`Editing event: ${eventName}`);
  const handleDelete = (eventName) => {
    if(window.confirm(`Are you sure you want to delete "${eventName}"?`)) alert("Event deleted!");
  };

  return (
    <div className="animate-fade-in">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>
      <RecentEventsTable 
        events={recentEvents} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onViewAll={() => setActiveTab('manage')} 
      />
    </div>
  );
};

export default OverviewTab;