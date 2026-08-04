import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // 1. بنجيب التوكن وبيانات المستخدم من التخزين المحلي
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  // 2. إذا ما في توكن، يعني مش مسجل دخول -> بنرجعه لصفحة تسجيل الدخول
  if (!token || !user) {
    return <Navigate to="/auth" replace />; // استبدل /login بالمسار تبع صفحة الدخول عندك
  }

  // 3. إذا الصفحة مخصصة لأدوار معينة (مثلاً لرؤساء الأندية فقط) والمستخدم ما عنده الصلاحية
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // بنرجعه لصفحة ما عنده صلاحية، أو لصفحته الافتراضية
    return <Navigate to={user.role === 'STUDENT' ? '/student-dashboard' : '/'} replace />;
  }

  // 4. إذا كل الشروط تمام، بنسمحله يدخل ويشوف الصفحة
  return children;
};

export default ProtectedRoute;