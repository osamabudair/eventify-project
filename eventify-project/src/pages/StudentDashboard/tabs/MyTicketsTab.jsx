// --- Imports ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../components/common/EmptyState';
import { EventCardSkeleton } from '../../../components/common/Skeletons';
import {
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Ban,
  Archive,
  Ticket,
  X,
  Star,
} from 'lucide-react';
import {
  getMyRegistrationsApi,
  cancelRegistrationApi,
  submitEventReviewApi,
} from '../../../api/axiosInstance';
import ConfirmDialog from '../../../components/ConfirmDialog/ConfirmDialog';
import ReviewModal from '../../../components/ReviewModal/ReviewModal';
import './MyTicketsTab.css';

// --- Helpers: Check if event has concluded in local timezone ---
const parseEventDate = (dateVal) => {
  if (!dateVal) return null;
  if (Array.isArray(dateVal)) {
    const [y, m = 1, d = 1] = dateVal;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  if (typeof dateVal === 'string' && dateVal.includes('-')) {
    const parts = dateVal.split('T')[0].split('-');
    if (parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0);
    }
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 0, 0, 0, 0);
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

const parseTimeOnDate = (baseDate, timeVal, defaultHour = 23, defaultMinute = 59) => {
  const d = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    defaultHour,
    defaultMinute,
    59,
    999
  );
  if (!timeVal || timeVal === 'TBA') {
    return d;
  }

  if (Array.isArray(timeVal)) {
    const [h = defaultHour, m = defaultMinute] = timeVal;
    d.setHours(Number(h), Number(m), 59, 999);
    return d;
  }

  if (typeof timeVal === 'string') {
    const isPM = /pm/i.test(timeVal);
    const isAM = /am/i.test(timeVal);
    const cleaned = timeVal.replace(/(am|pm)/gi, '').trim();
    const parts = cleaned.split(':');

    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10) || 0;
    if (isNaN(hours)) return d;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    d.setHours(hours, minutes, 59, 999);
  }
  return d;
};

const isEventFinished = (event) => {
  if (!event || !event.date) return false;
  const baseDate = parseEventDate(event.date);
  if (!baseDate) return false;

  let endStr = event.endTime;
  if (!endStr && typeof event.time === 'string' && event.time.includes('-')) {
    endStr = event.time.split('-')[1]?.trim();
  }

  const endDateTime = parseTimeOnDate(baseDate, endStr, 23, 59);
  return new Date().getTime() > endDateTime.getTime();
};

const formatLocalTicketDate = (dateVal) => {
  const parsed = parseEventDate(dateVal);
  if (!parsed) return String(dateVal || '');
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const MyTicketsTab = ({ showToast }) => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('active');

  const [cancelConfirm, setCancelConfirm] = useState({ isOpen: false, regId: null, title: '' });
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    eventId: null,
    eventTitle: '',
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedEventIds, setReviewedEventIds] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const key = `reviewed_events_${user.id || user._id || user.email || 'guest'}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchMyTickets = async () => {
      try {
        const res = await getMyRegistrationsApi();
        if (isMounted) {
          setRegistrations(res.data || []);
        }
      } catch {
        if (isMounted) {
          setRegistrations([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyTickets();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshMyTickets = async () => {
    try {
      const res = await getMyRegistrationsApi();
      setRegistrations(res.data || []);
    } catch {
      // Graceful fallback
    }
  };

  const promptCancel = (regId, eventTitle) => {
    setCancelConfirm({ isOpen: true, regId, title: eventTitle });
  };

  const executeCancelTicket = async () => {
    const { regId, title } = cancelConfirm;
    setCancelConfirm({ isOpen: false, regId: null, title: '' });
    try {
      await cancelRegistrationApi(regId);
      if (showToast) showToast(`Ticket for "${title}" has been cancelled`, 'info');
      refreshMyTickets();
    } catch {
      if (showToast) showToast('Failed to cancel ticket', 'error');
    }
  };

  const handleOpenReviewModal = (eventId, eventTitle) => {
    setReviewModal({ isOpen: true, eventId, eventTitle });
  };

  const handleSubmitReview = async ({ rating, comment }) => {
    const { eventId, eventTitle } = reviewModal;
    if (!eventId) return;

    setIsSubmittingReview(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userKey = user.id || user._id || user.email || 'guest';

    try {
      await submitEventReviewApi(eventId, { rating, comment });
    } catch {
      // Persist locally if backend endpoint is temporarily offline
      const localKey = `event_reviews_${eventId}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      const newReview = {
        id: Date.now(),
        eventId,
        userId: user.id || user._id,
        userName: user.name || user.username || 'Attendee',
        userAvatarUrl:
          user.avatarUrl ||
          user.profileImageUrl ||
          user.avatar ||
          localStorage.getItem(`avatar_${userKey}`) ||
          null,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(localKey, JSON.stringify([newReview, ...existing]));
    } finally {
      const updatedReviewed = Array.from(new Set([...reviewedEventIds, String(eventId)]));
      setReviewedEventIds(updatedReviewed);
      localStorage.setItem(`reviewed_events_${userKey}`, JSON.stringify(updatedReviewed));
      setIsSubmittingReview(false);
      setReviewModal({ isOpen: false, eventId: null, eventTitle: '' });
      if (showToast) {
        showToast(`Thank you for reviewing "${eventTitle}"!`, 'success');
      }
    }
  };

  const renderStatus = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="status-badge approved">
          <CheckCircle size={14} /> Confirmed
        </span>
      );
    } else if (s === 'pending') {
      return (
        <span className="status-badge pending">
          <Clock size={14} /> Pending
        </span>
      );
    } else if (s === 'cancelled') {
      return (
        <span className="status-badge cancelled">
          <Ban size={14} /> Cancelled
        </span>
      );
    } else {
      return (
        <span className="status-badge rejected">
          <XCircle size={14} /> Rejected
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="modern-view-section">
        <div className="tickets-tab-header">
          <div>
            <h3 className="section-heading">My Tickets & Registrations</h3>
            <p className="text-secondary">
              Manage your event passes and review registration history.
            </p>
          </div>
        </div>
        <div className="tickets-grid">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>
    );
  }

  const isTicketArchived = (r) =>
    ['cancelled', 'rejected'].includes(r.status?.toLowerCase()) || isEventFinished(r.event);

  const activeTickets = registrations.filter(
    (r) => ['approved', 'pending'].includes(r.status?.toLowerCase()) && !isEventFinished(r.event)
  );
  const archivedTickets = registrations.filter(isTicketArchived);

  const currentDisplayList = activeSubTab === 'active' ? activeTickets : archivedTickets;

  return (
    <div className="animate-fade-in modern-view-section">
      <div className="tickets-tab-header">
        <div>
          <h3 className="section-heading">My Tickets & Registrations</h3>
          <p className="text-secondary">
            Manage your event passes and review registration history.
          </p>
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
        activeSubTab === 'active' ? (
          <EmptyState
            icon={<Ticket size={24} />}
            title="No registrations yet"
            description="You haven't signed up for any events or workshops yet. Browse the community schedule to reserve your spot."
            actionText="Explore Events"
            onAction={() => navigate('/explore')}
          />
        ) : (
          <EmptyState
            icon={<Archive size={24} />}
            title="No archived tickets"
            description="Your past attendances and cancelled registrations will be preserved here."
          />
        )
      ) : (
        <div className="tickets-grid">
          {currentDisplayList.map((reg) => {
            const isArchived = isTicketArchived(reg);
            const isApprovedStatus = reg.status?.toLowerCase() === 'approved';
            const isConfirmed = isApprovedStatus && !isArchived;
            const isPending = reg.status?.toLowerCase() === 'pending' && !isArchived;
            const isCompletedApproved = isApprovedStatus && isEventFinished(reg.event);
            const eventId = reg.event?.id || reg.event?._id;
            const hasReviewed = eventId && reviewedEventIds.includes(String(eventId));
            const eventTitle = reg.event?.title || reg.event?.name || 'Event Removed';

            return (
              <div
                key={reg._id || reg.id}
                className={`ticket-card ${isPending ? 'pending-ticket' : ''} ${
                  isArchived ? 'archived-ticket' : ''
                }`}
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
                    <span>{formatLocalTicketDate(reg.event?.date)}</span>
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
                    <span className="ticket-number">
                      Ticket #{String(reg._id || reg.id).slice(-6).toUpperCase()}
                    </span>
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

                  {isCompletedApproved && eventId && (
                    hasReviewed ? (
                      <span className="ticket-reviewed-badge">
                        <Star size={13} fill="currentColor" /> Reviewed
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="ticket-review-action"
                        onClick={() => handleOpenReviewModal(eventId, eventTitle)}
                        title="Rate and review this completed event"
                      >
                        <Star size={14} /> Rate & Review
                      </button>
                    )
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

      <ReviewModal
        isOpen={reviewModal.isOpen}
        eventTitle={reviewModal.eventTitle}
        isSubmitting={isSubmittingReview}
        onClose={() => setReviewModal({ isOpen: false, eventId: null, eventTitle: '' })}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
};

export default MyTicketsTab;
