import React from 'react';
import '../../styles/skeleton.css';

export const EventCardSkeleton = () => (
  <div className="event-card-skeleton">
    <div className="skeleton-media-wrapper">
      <div className="skeleton-box" />
    </div>
    <div className="skeleton-content">
      <div className="skeleton-box skeleton-chip" />
      <div className="skeleton-box skeleton-title" />
      <div className="skeleton-box skeleton-subtitle" />
      <div className="skeleton-footer-row">
        <div className="skeleton-box skeleton-meta-chip" />
        <div className="skeleton-box skeleton-btn-pill" />
      </div>
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="stat-card-skeleton">
    <div className="skeleton-box skeleton-stat-icon" />
    <div className="skeleton-stat-details">
      <div className="skeleton-box skeleton-stat-value" />
      <div className="skeleton-box skeleton-stat-label" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="table-skeleton-row">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx}>
        <div 
          className="skeleton-box skeleton-cell-text" 
          style={{ width: idx === 0 ? '80%' : idx === columns - 1 ? '50%' : '65%' }}
        />
      </td>
    ))}
  </tr>
);

