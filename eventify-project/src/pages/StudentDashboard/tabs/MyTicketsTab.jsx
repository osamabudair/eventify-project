// --- Imports ---
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar as CalendarIcon, CheckCircle, Loader2, XCircle, Ban, Archive, Ticket, X } from 'lucide-react';
import { getMyRegistrationsApi, cancelRegistrationApi } from '../../../api/axiosInstance'; 
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import './MyTicketsTab.css';

const MyTicketsTab = ({ showToast }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('active'); 

  const [cancelConfirm, setCancelConfirm] = useState({ isOpen: false, regId: null, title: '' });

  const fetchMyTickets = async () => {
    try {
      const res = await getMyRegistrationsApi();
      setRegistrations(res.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const promptCancel = (regId, eventTitle) => {
    setCancelConfirm({ isOpen: true, regId, title: eventTitle });
  };

  const executeCancelTicket = async () => {
    const { regId, title } = cancelConfirm;
    setCancelConfirm({ isOpen: false, regId: null, title: '' });
    try {
      await cancelRegistrationApi(regId);
      if (showToast) showToast(`Ticket for "${title}" has been cancelled`, 'info');
      fetchMyTickets();
    } catch {
      if (showToast) showToast("Failed to cancel ticket", 'error');
    }
  };
  const renderStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return <span className="status-badge approved"><CheckCircle size={14} /> Confirmed</span>;
    } else if (s === 'pending') {
      return <span className="status-badge pending"><Clock size={14} /> Pending</span>;
    } else if (s === 'cancelled') {
      return <span className="status-badge cancelled"><Ban size={14} /> Cancelled</span>;
    } else {
      return <span className="status-badge rejected"><XCircle size={14} /> Rejected</span>;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary-color)' }} />
      </div>
    );
  }

  const activeTickets = registrations.filter(r => ['approved', 'pending'].includes(r.status?.toLowerCase()));
  const archivedTickets = registrations.filter(r => ['cancelled', 'rejected'].includes(r.status?.toLowerCase()));

  const currentDisplayList = activeSubTab === 'active' ? activeTickets : archivedTickets;

  return (
    <div className="animate-fade-in modern-view-section">
      <div className="tickets-tab-header">
        <div>
          <h3 className="section-heading">My Tickets & Registrations</h3>
          <p className="text-secondary">Manage your event passes and review registration history.</p>
        </div>

        <div className="archive-toggle-group">
          <button 
            className={`archive-toggle-btn ${activeSubTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('active')}
          >
            <Ticket size={16} /> Active Tickets ({activeTickets.length})
          </button>
          <button 
            className={`archive-toggle-btn ${activeSubTab === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('archived')}
          >
            <Archive size={16} /> History & Archive ({archivedTickets.length})
          </button>
        </div>
      </div>

      {currentDisplayList.length === 0 ? (
        <div className="empty-state-container">
          <p>{activeSubTab === 'active' ? "You don't have any active tickets right now." : "No archived or rejected tickets."}</p>
        </div>
      ) : (
        <div className="tickets-grid">
          {currentDisplayList.map((reg) => {
            const isConfirmed = reg.status?.toLowerCase() === 'approved';
            const isPending = reg.status?.toLowerCase() === 'pending';
            const isArchived = ['cancelled', 'rejected'].includes(reg.status?.toLowerCase());
            const eventTitle = reg.event?.title || reg.event?.name || 'Event Removed';

            return (
              <div 
                key={reg._id || reg.id} 
                className={`ticket-card ${isPending ? 'pending-ticket' : ''} ${isArchived ? 'archived-ticket' : ''}`}
              >
                <div className="ticket-header">
                  <div>
                    <h4>{eventTitle}</h4>
                    <span className="ticket-category">{reg.event?.category || 'General'}</span>
                  </div>
                  {renderStatus(reg.status)}
                </div>
                
                <div className="ticket-body">
                  <div className="ticket-info">
                    <CalendarIcon size={16} /> 
                    <span>{new Date(reg.event?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="ticket-info">
                    <Clock size={16} /> <span>{reg.event?.time || 'TBA'}</span>
                  </div>
                  <div className="ticket-info">
                    <MapPin size={16} /> <span>{reg.event?.location || 'Amman'}</span>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="ticket-footer-left">
                    <div className="barcode">||| |||| || ||| ||||</div>
                    <span className="ticket-number">Ticket #{String(reg._id || reg.id).slice(-6).toUpperCase()}</span>
                  </div>

                  {(isConfirmed || isPending) && (
                    <button 
                      className="ticket-cancel-action"
                      onClick={() => promptCancel(reg._id || reg.id, eventTitle)}
                      title="Cancel this registration"
                    >
                      <X size={14} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog
        isOpen={cancelConfirm.isOpen}
        title="Cancel Ticket"
        message={`Are you sure you want to cancel your ticket for "${cancelConfirm.title}"?`}
        confirmText="Yes, Cancel"
        onConfirm={executeCancelTicket}
        onCancel={() => setCancelConfirm({ isOpen: false, regId: null, title: '' })}
      />
    </div>
  );
};

export default MyTicketsTab;