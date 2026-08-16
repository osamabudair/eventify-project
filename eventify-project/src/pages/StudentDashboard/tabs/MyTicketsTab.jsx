// --- Imports ---
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar as CalendarIcon, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { getMyRegistrationsApi } from '../../../api/axiosInstance'; 

const MyTicketsTab = () => {
  // --- State Management ---
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Side Effects ---
  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await getMyRegistrationsApi();
      setRegistrations(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const renderStatus = (status) => {
    if (status === 'approved') {
      return <span className="status-badge approved"><CheckCircle size={14} /> Approved</span>;
    } else if (status === 'pending') {
      return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
    } else {
      return <span className="status-badge rejected"><XCircle size={14} /> Rejected</span>;
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-color)' }} />
      </div>
    );
  }

  // --- Data Filtering ---
  const approvedTickets = registrations.filter(reg => reg.status === 'approved');
  const pendingTickets = registrations.filter(reg => reg.status === 'pending');

  // --- Main Render ---
  return (
    <div className="animate-fade-in modern-view-section">
      
      {/* Header Section */}
      <div className="tab-header" style={{ marginBottom: '32px' }}>
        <h3 className="section-heading">My Tickets & Registrations</h3>
        <p className="text-secondary">Manage your upcoming event tickets and track pending requests.</p>
      </div>

      {registrations.length === 0 ? (
        
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <p>You haven't registered for any events yet.</p>
        </div>

      ) : (
        <>
          {/* Confirmed Tickets Section */}
          {approvedTickets.length > 0 && (
            <div className="tickets-section" style={{ marginBottom: '40px' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>🎟️ Confirmed Tickets</h4>
              <div className="tickets-grid">
                {approvedTickets.map((reg) => (
                  <div key={reg._id} className="ticket-card">
                    
                    <div className="ticket-header">
                      <h4>{reg.event?.title || 'Event Removed'}</h4>
                      {renderStatus(reg.status)}
                    </div>
                    
                    <div className="ticket-body">
                      <div className="ticket-info">
                        <CalendarIcon size={16} /> 
                        <span>{new Date(reg.event?.date).toLocaleDateString()}</span>
                      </div>
                      <div className="ticket-info">
                        <Clock size={16} /> <span>{reg.event?.time || 'TBA'}</span>
                      </div>
                      <div className="ticket-info">
                        <MapPin size={16} /> <span>{reg.event?.location || 'TBA'}</span>
                      </div>
                    </div>
                    
                    <div className="ticket-footer">
                      <div className="barcode">||| |||| || ||| |||| ||</div>
                      <span>Ticket ID: #{reg._id.slice(-6).toUpperCase()}</span>
                    </div>
                    
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Requests Section */}
          {pendingTickets.length > 0 && (
            <div className="tickets-section">
              <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>⏳ Pending Requests</h4>
              <div className="tickets-grid">
                {pendingTickets.map((reg) => (
                  <div key={reg._id} className="ticket-card" style={{ opacity: 0.85, borderStyle: 'dashed' }}>
                    
                    <div className="ticket-header">
                      <h4>{reg.event?.title || 'Event Removed'}</h4>
                      {renderStatus(reg.status)}
                    </div>
                    
                    <div className="ticket-body">
                      <div className="ticket-info">
                        <CalendarIcon size={16} /> 
                        <span>{new Date(reg.event?.date).toLocaleDateString()}</span>
                      </div>
                      <div className="ticket-info">
                        <MapPin size={16} /> <span>Waiting for approval...</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTicketsTab;