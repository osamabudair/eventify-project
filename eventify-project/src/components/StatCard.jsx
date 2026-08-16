// --- Imports ---
import React from 'react';

const StatCard = ({ title, value, icon }) => {
  // --- Main Render ---
  return (
    <div className="stat-card">
      
      {/* Icon Section */}
      <div className="stat-icon">
        {icon}
      </div>
      
      {/* Details Section */}
      <div className="stat-details">
        <h3>{value}</h3>
        <p>{title}</p>
      </div>
      
    </div>
  );
};

export default StatCard;