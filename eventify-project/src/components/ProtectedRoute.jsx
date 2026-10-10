// ==================== IMPORTS ====================
import React from 'react';
import { Navigate } from 'react-router-dom';

// ==================== COMPONENT ====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Prevent unapproved Club Leaders from accessing dashboards directly
  if (user.role === 'CLUB_LEADER' && user.approved === false) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/auth" replace />;
  }

  // Check Role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'CLUB_LEADER') {
      return <Navigate to="/club-dashboard" replace />;
    } else if (user.role === 'STUDENT') {
      return <Navigate to="/student-dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;