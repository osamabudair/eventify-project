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

export const TableRowSkeleton = ({ rows = 1, columns = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <tr key={rowIdx} className="table-skeleton-row">
        {Array.from({ length: columns }).map((__, colIdx) => (
          <td key={colIdx}>
            <div
              className="skeleton-box skeleton-cell-text"
              style={{
                width:
                  colIdx === 0 ? '80%' : colIdx === columns - 1 ? '50%' : '65%',
              }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);
