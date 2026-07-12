import React from 'react';
import { MapPin, Clock, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';

const MyTicketsTab = () => {
  const tickets = [
    { id: 1, event: 'AI Fundamentals Workshop', date: 'July 15, 2026', time: '10:00 AM', location: 'Hall A', status: 'Approved' },
    { id: 2, event: 'Web Dev Bootcamp', date: 'July 22, 2026', time: '12:00 PM', location: 'Lab 3', status: 'Pending' },
  ];

  // دالة برمجية لإرجاع شكل الحالة (Icon + Text) بناءً على الكلمة
  const renderStatus = (status) => {
    if (status === 'Approved') {
      return (
        <span className="status-badge approved">
          <CheckCircle size={14} /> {status}
        </span>
      );
    } else if (status === 'Pending') {
      return (
        <span className="status-badge pending">
          <Clock size={14} /> {status}
        </span>
      );
    }
    return <span className="status-badge">{status}</span>;
  };

  return (
    <div className="animate-fade-in tickets-grid">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="ticket-card">
          
          <div className="ticket-header">
            <h4>{ticket.event}</h4>
            {/* استدعاء دالة الحالة هنا */}
            {renderStatus(ticket.status)}
          </div>
          
          <div className="ticket-body">
            <div className="ticket-info">
              <CalendarIcon size={16} /> <span>{ticket.date}</span>
            </div>
            <div className="ticket-info">
              <Clock size={16} /> <span>{ticket.time}</span>
            </div>
            <div className="ticket-info">
              <MapPin size={16} /> <span>{ticket.location}</span>
            </div>
          </div>
          
          <div className="ticket-footer">
            <div className="barcode">||| |||| || ||| |||| ||</div>
            <span>Ticket ID: #{ticket.id}4098</span>
          </div>
          
        </div>
      ))}
    </div>
  );
};

export default MyTicketsTab;