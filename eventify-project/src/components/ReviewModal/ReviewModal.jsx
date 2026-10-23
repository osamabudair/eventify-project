import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, eventTitle, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    onSubmit({ rating, comment: comment.trim() });
  };

  const activeStars = hoveredRating || rating;

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div
        className="review-modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <div className="review-modal-header">
          <div>
            <h3 id="review-modal-title">Rate & Review Event</h3>
            <p className="review-modal-subtitle">{eventTitle}</p>
          </div>
          <button
            type="button"
            className="review-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="review-modal-form">
          <div className="review-star-picker-group">
            <label>Your Rating</label>
            <div className="review-stars-row">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= activeStars;
                return (
                  <button
                    key={starVal}
                    type="button"
                    className={`review-star-btn ${isFilled ? 'filled' : ''}`}
                    onMouseEnter={() => setHoveredRating(starVal)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(starVal)}
                    aria-label={`Rate ${starVal} out of 5 stars`}
                  >
                    <Star
                      size={28}
                      fill={isFilled ? 'currentColor' : 'none'}
                      strokeWidth={2}
                    />
                  </button>
                );
              })}
              <span className="review-rating-number">{rating}.0 / 5.0</span>
            </div>
          </div>

          <div className="review-textarea-group">
            <div className="review-textarea-label-row">
              <label htmlFor="review-comment">Your Experience (Optional)</label>
              <span className="review-char-count">{comment.length} / 1000</span>
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1000}
              placeholder="Share what you enjoyed or learned at this event..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="review-modal-actions">
            <button
              type="button"
              className="review-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="review-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;

