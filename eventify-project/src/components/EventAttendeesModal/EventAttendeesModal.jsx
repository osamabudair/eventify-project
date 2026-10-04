import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Calendar, UserX, Loader2 } from 'lucide-react';
import axiosInstance, { updateRegistrationStatusApi } from '../../api/axiosInstance';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import './EventAttendeesModal.css';

const EventAttendeesModal = ({ isOpen, onClose, event, onAttendeeRemoved, showToast }) => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [confirmData, setConfirmData] = useState({ isOpen: false, regId: null, name: '' });

  useEffect(() => {
    if (isOpen && event) {
      fetchEventAttendees();
    }
  }, [isOpen, event]);

  const fetchEventAttendees = async () => {
    setLoading(true);
    try {
      const eventId = event._id || event.id;
      const res = await axiosInstance.get(`/registrations/event/${eventId}/approved`);
      setAttendees(res.data || []);
    } catch {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const leaderId = user.id || user._id;
        const res = await axiosInstance.get(`/registrations/leader/${leaderId}/all`);
        const eventId = event._id || event.id;
        const filtered = (res.data || []).filter(
          r => (r.eventId === eventId || r.event?.id === eventId) && r.status === 'APPROVED'
        );
        setAttendees(filtered);
      } catch {
        setAttendees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const executeCancel = async () => {
    const { regId, name } = confirmData;
    setConfirmData({ isOpen: false, regId: null, name: '' });
    setProcessingId(regId);
    try {
      await updateRegistrationStatusApi(regId, 'cancelled');
      setAttendees(prev => prev.filter(a => (a.id || a.registrationId) !== regId));
      if (showToast) showToast(`Cancelled registration for ${name}`, 'info');
      if (onAttendeeRemoved) onAttendeeRemoved();
    } catch {
      if (showToast) showToast(`Failed to cancel registration for ${name}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <>
      <ConfirmDialog
        isOpen={confirmData.isOpen}
        title="Cancel Registration"
        message={`Are you sure you want to cancel the registration for "${confirmData.name}"?`}
        confirmText="Yes, Cancel"
        onConfirm={executeCancel}
        onCancel={() => setConfirmData({ isOpen: false, regId: null, name: '' })}
      />

      <div className="modal-overlay" onClick={onClose}>
        <div className="attendees-modal-card" onClick={e => e.stopPropagation()}>
          <div className="attendees-modal-header">
            <div className="attendees-header-title">
              <Users size={22} className="header-icon" />
              <div>
                <h3>Approved Attendees</h3>
                <p>{event.name || event.title}</p>
              </div>
            </div>
            <button className="close-btn-modern" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="attendees-modal-body">
            {loading ? (
              <div className="attendees-loading">
                <Loader2 className="animate-spin" size={32} />
                <p>Loading attendees list...</p>
              </div>
            ) : attendees.length === 0 ? (
              <div className="attendees-empty">
                <Users size={44} opacity={0.3} />
                <p>No approved attendees yet for this event.</p>
              </div>
            ) : (
              <div className="attendees-list">
                {attendees.map((attendee) => {
                  const regId = attendee.id || attendee.registrationId;
                  const studentName = attendee.studentName || attendee.student?.name || attendee.name || 'Student';
                  const studentEmail = attendee.studentEmail || attendee.student?.email || attendee.email || (attendee.studentName ? `${attendee.studentName.replace(/\s+/g, '').toLowerCase()}@university.edu` : 'student@university.edu');
                  const appliedDate = attendee.appliedOn || attendee.createdAt || attendee.date;

                  return (
                    <div key={regId} className="attendee-item">
                      <div className="attendee-avatar">
                        {studentName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="attendee-details">
                        <span className="attendee-name">{studentName}</span>
                        <span className="attendee-email"><Mail size={13} /> {studentEmail}</span>
                        {appliedDate && (
                          <span className="attendee-date">
                            <Calendar size={13} /> {new Date(appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <button
                        className="attendee-cancel-btn"
                        disabled={processingId === regId}
                        onClick={() => setConfirmData({ isOpen: true, regId, name: studentName })}
                        title="Cancel student registration"
                      >
                        {processingId === regId ? (
                          <Loader2 className="animate-spin" size={15} />
                        ) : (
                          <>
                            <UserX size={15} /> Cancel
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventAttendeesModal;