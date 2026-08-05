import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Loader2 } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import RecentEventsTable from '../../../components/RecentEventsTable';
import { getMyEventsApi } from '../../../api/axiosInstance';
import './OverviewTab.css';

const OverviewTab = ({ setActiveTab }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const res = await getMyEventsApi();
        setEvents(res.data);
      } catch (error) {
        console.error("Error fetching overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // 1. حساب إجمالي عدد الفعاليات الحقيقية
  const totalEvents = events.length;

  // 2. حساب إجمالي المسجلين في كل الفعاليات الخاصة بالنادي
  const totalRegistrations = events.reduce((sum, event) => {
    return sum + (event.attendees?.length || 0);
  }, 0);

  // 3. تجهيز بيانات البطاقات الإحصائية
  const stats = [
    { title: 'Total Events', value: totalEvents.toString(), icon: <Calendar size={24} /> },
    { title: 'Total Registrations', value: totalRegistrations.toString(), icon: <Users size={24} /> },
    { title: 'Pending Requests', value: '0', icon: <Clock size={24} /> }, // سنربطها لاحقاً بطلبات الانضمام
  ];

  // 4. تجهيز أول 3 فعاليات فقط للجدول المختصر
  const recentEventsFormatted = events.slice(0, 3).map((event) => {
    const isPast = new Date(event.date) < new Date();
    return {
      id: event._id,
      name: event.title,
      date: new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: isPast ? 'Completed' : 'Active'
    };
  });

  const handleEdit = (eventName) => alert(`Editing event: ${eventName}`);
  const handleDelete = (eventName) => {
    if(window.confirm(`Are you sure you want to delete "${eventName}"?`)) alert("Event deleted!");
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: '#6366f1' }}>
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>

      <RecentEventsTable 
        events={recentEventsFormatted} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onViewAll={() => setActiveTab('manage')} 
      />
    </div>
  );
};

export default OverviewTab;