import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, Loader2 } from 'lucide-react';
import StatCard from '../../../components/StatCard';
import RecentEventsTable from '../../../components/RecentEventsTable';
import { getMyEventsApi, deleteEventApi } from '../../../api/axiosInstance'; // 👈 استيراد دالة الحذف
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

  const totalEvents = events.length;

  const totalRegistrations = events.reduce((sum, event) => {
    return sum + (event.attendees?.length || 0);
  }, 0);

  const stats = [
    { title: 'Total Events', value: totalEvents.toString(), icon: <Calendar size={24} /> },
    { title: 'Total Registrations', value: totalRegistrations.toString(), icon: <Users size={24} /> },
    { title: 'Pending Requests', value: '0', icon: <Clock size={24} /> },
  ];

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

  // 👈 دالة الحذف الجديدة
  const handleDelete = async (eventId, eventName) => {
    if (window.confirm(`Are you sure you want to delete "${eventName}"?`)) {
      try {
        await deleteEventApi(eventId);
        // تحديث القائمة عشان الأرقام والجدول يتحدثوا فوراً
        setEvents(events.filter(event => event._id !== eventId));
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to delete event");
      }
    }
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