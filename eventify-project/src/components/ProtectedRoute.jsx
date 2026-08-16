// --- Imports ---
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // --- Data Retrieval ---
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // --- Authentication Check ---
  // Redirect to the auth page if the user is not logged in
  if (!token || !user) {
    return <Navigate to="/auth" replace />;
  }

  // --- Role Authorization Check ---
  // Redirect to the appropriate dashboard if the user lacks the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'STUDENT' ? '/student-dashboard' : '/'} replace />;
  }

  // --- Access Granted ---
  return children;
};

export default ProtectedRoute;