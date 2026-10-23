// ==================== IMPORTS ====================
import axios from 'axios';

const LOCAL_API_URL = 'http://localhost:8080';
const PRODUCTION_API_URL = 'https://eventify-java-backend.onrender.com';

// Resolve the backend base URL automatically for local development vs. cloud production
const getBaseURL = () => {
  // 1. Explicit environment override takes priority when defined and not empty
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Vite development server (npm run dev)
  if (import.meta.env.DEV) {
    return LOCAL_API_URL;
  }

  // 3. Runtime hostname fallback for local previews or LAN access
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname);

    if (isLocalhost) {
      return LOCAL_API_URL;
    }
  }

  // 4. Default production backend hosted on Render
  return PRODUCTION_API_URL;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Ensure /api prefix and attach JWT token automatically
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url && !config.url.startsWith('http') && !config.url.startsWith('/api')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Proper Session Expiry Handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
      const isPendingApproval = error.response.data?.error === 'PENDING_APPROVAL';
      const isSuspended = error.response.data?.error === 'ACCOUNT_SUSPENDED';

      // Only clear storage and redirect on actual 401 Unauthorized or when account is suspended
      // Do NOT kick out user on standard 403 Forbidden or Pending Approval
      if ((status === 401 || isSuspended) && !isAuthEndpoint && !isPendingApproval) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        const currentPath = window.location.pathname;
        const isPublic = 
          currentPath === '/' || 
          currentPath === '/auth' || 
          currentPath === '/explore' || 
          currentPath.startsWith('/event/');

        if (!isPublic) {
          window.location.href = '/auth';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper: Format time value (string or [hour, minute] array) into readable string
const formatTimeValue = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) {
    const [h = 0, m = 0] = val;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  return String(val);
};

// Helper: Standardize event object schema
const formatEvent = (ev) => {
  if (!ev) return null;
  const startStr = formatTimeValue(ev.startTime);
  const endStr = formatTimeValue(ev.endTime);
  const formattedTime = (startStr && endStr) 
    ? `${startStr} - ${endStr}` 
    : (ev.time || (startStr ? `${startStr}` : "TBA"));

  const attendeesNum = Number(ev.registeredCount ?? ev.approvedAttendees ?? ev.approvedCount ?? (Array.isArray(ev.attendees) ? ev.attendees.length : ev.attendees) ?? 0);
  const totalCapacity = Number(ev.capacity ?? ev.maxAttendees ?? ev.maxSeats ?? 20);

  return {
    ...ev,
    _id: ev.id,
    id: ev.id,
    title: ev.name || ev.title,
    name: ev.name || ev.title,
    date: ev.date,
    startTime: startStr,
    endTime: endStr,
    time: formattedTime,
    approvedAttendees: attendeesNum,
    approvedCount: attendeesNum,
    attendees: attendeesNum,
    registeredCount: attendeesNum,
    remainingSeats: ev.remainingSeats !== undefined ? Number(ev.remainingSeats) : Math.max(0, totalCapacity - attendeesNum),
    maxAttendees: totalCapacity,
    capacity: totalCapacity,
    image: ev.imageUrl || ev.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
    imageUrl: ev.imageUrl || ev.image,
    organizer: {
      username: ev.organizerName || ev.organizer?.username || "University Club",
      name: ev.organizerName || ev.organizer?.username || "University Club"
    },
    organizerName: ev.organizerName || ev.organizer?.username || "University Club"
  };
};

// ==================== 1. AUTH APIS ====================
export const loginApi = async (credentials) => {
  const normalizedCredentials = {
    ...credentials,
    email: (credentials?.email || '').trim().toLowerCase(),
  };
  const response = await axiosInstance.post('/api/auth/login', normalizedCredentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response;
};

export const registerApi = async (userData) => {
  const normalizedUserData = {
    ...userData,
    email: (userData?.email || '').trim().toLowerCase(),
  };
  const response = await axiosInstance.post('/api/auth/register', normalizedUserData);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response;
};

// ==================== 2. EVENTS & EXPLORE ====================
export const getAllEventsApi = async () => {
  const res = await axiosInstance.get('/api/events/explore');
  return { ...res, data: Array.isArray(res.data) ? res.data.map(formatEvent) : [] };
};

export const getUpcomingHighlightsApi = async () => {
  const res = await axiosInstance.get('/api/events/upcoming-highlights');
  return { ...res, data: Array.isArray(res.data) ? res.data.map(formatEvent) : [] };
};

export const getEventByIdApi = async (id) => {
  const res = await axiosInstance.get(`/api/events/${id}`);
  const data = res.data;

  const orgName = 
    data.organizer?.name || 
    data.organizer?.fullName || 
    data.organizer?.username || 
    data.organizerName || 
    "University Club";

  const attendeesNum = Number(data.approvedAttendees ?? data.approvedCount ?? (Array.isArray(data.attendees) ? data.attendees.length : data.attendees) ?? 0);
  const totalCapacity = Number(data.capacity ?? data.maxAttendees ?? data.maxSeats ?? 0);
  const startStr = formatTimeValue(data.startTime);
  const endStr = formatTimeValue(data.endTime);

  const formatted = {
    ...data,
    id: data.id,
    _id: data.id,
    title: data.name,
    name: data.name,
    startTime: startStr,
    endTime: endStr,
    club: orgName,
    organizerName: orgName,
    organizer: {
      name: orgName,
      username: orgName
    },
    approvedAttendees: attendeesNum,
    approvedCount: attendeesNum,
    capacity: totalCapacity,
    maxAttendees: totalCapacity
  };

  return { ...res, data: formatted };
};

export const getEventApprovedCountApi = async (eventId) => {
  try {
    const res = await axiosInstance.get(`/api/registrations/event/${eventId}/count`);
    if (typeof res.data === 'number') return res.data;
  } catch {
    // Proceed to fallback
  }
  try {
    const res = await axiosInstance.get(`/api/registrations/event/${eventId}/approved`);
    const data = res.data;
    if (Array.isArray(data)) return data.length;
    return data && typeof data === 'object' && (data.registrationId || data.id) ? 1 : 0;
  } catch {
    return 0;
  }
};

export const createEventApi = async (eventData) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizerId = user.id || user._id;
  return await axiosInstance.post('/api/events', {
    ...eventData,
    organizerId
  });
};

export const updateEventApi = async (id, eventData) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizerId = user.id || user._id;
  return await axiosInstance.put(`/api/events/${id}`, {
    ...eventData,
    organizerId
  });
};

export const deleteEventApi = async (id) => {
  return await axiosInstance.delete(`/api/events/${id}`);
};

export const getMyEventsApi = async (organizerId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const id = organizerId || user.id || user._id;
  const res = await axiosInstance.get(`/api/events/user/${id}`);
  return { ...res, data: Array.isArray(res.data) ? res.data.map(formatEvent) : [] };
};

// ==================== 3. LEADER DASHBOARD & REGISTRATIONS ====================
export const getOrganizerRegistrationsApi = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const leaderId = user.id || user._id;

  const res = await axiosInstance.get(`/api/registrations/leader/${leaderId}/pending`);
  
  const requests = (res.data || []).map(req => ({
    _id: req.id || req.registrationId,
    id: req.id || req.registrationId,
    status: 'pending',
    createdAt: req.appliedOn || req.registrationDate || new Date().toISOString(),
    user: {
      username: req.studentName || req.student?.name || 'Student'
    },
    event: {
      title: req.eventName || req.event?.name || 'Event'
    }
  }));

  return { ...res, data: requests };
};

export const getLeaderDashboardApi = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const leaderId = user.id || user._id;
  const res = await axiosInstance.get(`/api/leader/${leaderId}/dashboard`);
  return res.data;
};

export const updateRegistrationStatusApi = async (registrationId, status) => {
  const action = status.toLowerCase();
  
  if (action === 'approved' || action === 'approve') {
    return await axiosInstance.put(`/api/registrations/${registrationId}/approve`);
  } else if (action === 'rejected' || action === 'reject') {
    return await axiosInstance.put(`/api/registrations/${registrationId}/reject`);
  } else if (action === 'cancelled' || action === 'cancel') {
    return await axiosInstance.put(`/api/registrations/${registrationId}/cancel`);
  }
};

// ==================== 4. STUDENT PORTAL & TICKETS ====================
export const registerForEventApi = async (eventId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.id || user._id;
  return await axiosInstance.post(`/api/registrations/apply/${eventId}/student/${studentId}`);
};

export const getMyRegistrationsApi = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.id || user._id;
  const res = await axiosInstance.get(`/api/registrations/student/${studentId}/dashboard`);
  
  const formattedTickets = (res.data.tickets || []).map(t => {
    const realAppliedOn = t.appliedOn || t.registrationDate || t.createdAt;
    const startStr = formatTimeValue(t.startTime);
    const endStr = formatTimeValue(t.endTime);

    return {
      _id: String(t.registrationId || t.id),
      id: t.registrationId || t.id,
      status: (t.status || 'APPROVED').toLowerCase(),
      createdAt: realAppliedOn,
      appliedOn: realAppliedOn,
      event: {
        _id: t.eventId,
        id: t.eventId,
        title: t.eventName,
        name: t.eventName,
        date: t.date || t.eventDate,
        startTime: startStr,
        endTime: endStr,
        time: (startStr && endStr) ? `${startStr} - ${endStr}` : (startStr || "TBA"),
        location: t.location || "Amman",
        category: t.category || "General",
        organizerName: t.organizerName || "Club Leader"
      }
    };
  });

  return { ...res, data: formattedTickets };
};

export const cancelRegistrationApi = async (registrationId) => {
  return await axiosInstance.put(`/api/registrations/${registrationId}/cancel`);
};

// ==================== 5. PROFILE & AVATAR ====================
export const updateProfileApi = async (payload) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user._id;
  
  const requestBody = {
    name: payload.fullName || payload.name,
    currentPassword: payload.current || payload.currentPassword || null,
    newPassword: payload.new || payload.newPassword || null,
    confirmNewPassword: payload.confirm || payload.confirmNewPassword || payload.new || null,
    avatarUrl: payload.avatarUrl || undefined,
    profileImageUrl: payload.avatarUrl || undefined
  };

  const res = await axiosInstance.put(`/api/users/${userId}/profile`, requestBody);
  const resolvedAvatar = res.data?.avatarUrl || res.data?.profileImageUrl || payload.avatarUrl || user.avatarUrl || user.avatar;
  
  return {
    data: {
      message: "Profile updated successfully!",
      user: {
        ...user,
        username: res.data.name || requestBody.name,
        name: res.data.name || requestBody.name,
        email: res.data.email || user.email,
        avatarUrl: resolvedAvatar,
        profileImageUrl: resolvedAvatar,
        avatar: resolvedAvatar,
        profilePicture: resolvedAvatar
      }
    }
  };
};

export const updateAvatarApi = async (avatarPayload) => {
  if (avatarPayload instanceof FormData) {
    const res = await axiosInstance.put('/api/users/profile/avatar', avatarPayload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
  if (typeof File !== 'undefined' && (avatarPayload instanceof File || avatarPayload instanceof Blob)) {
    const formData = new FormData();
    formData.append('file', avatarPayload);
    const res = await axiosInstance.put('/api/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }
  const avatarUrl = typeof avatarPayload === 'string' ? avatarPayload : avatarPayload?.avatarUrl;
  const res = await axiosInstance.put('/api/users/profile/avatar', { avatarUrl });
  return res.data;
};

export const deleteAvatarApi = async () => {
  const res = await axiosInstance.delete('/api/users/profile/avatar');
  return res.data;
};

// ==================== 6. CATEGORIES ====================
export const getCategoriesApi = async () => {
  const res = await axiosInstance.get('/api/categories');
  return res.data;
};

// ==================== 7. NOTIFICATIONS ====================
export const getNotificationsApi = async () => {
  const res = await axiosInstance.get('/api/notifications');
  return res.data;
};

export const markNotificationReadApi = async (notificationId) => {
  const res = await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllNotificationsReadApi = async () => {
  const res = await axiosInstance.patch('/api/notifications/read-all');
  return res.data;
};

// ==================== 8. EVENT REVIEWS ====================
export const getEventReviewsApi = async (eventId) => {
  const res = await axiosInstance.get(`/api/events/${eventId}/reviews`);
  return res.data;
};

export const submitEventReviewApi = async (eventId, payload) => {
  const res = await axiosInstance.post(`/api/events/${eventId}/reviews`, payload);
  return res.data;
};

// ==================== 9. ADMIN PORTAL ====================
export const getPendingLeadersApi = async () => {
  return await axiosInstance.get('/api/admin/pending-leaders');
};

export const getAllLeadersApi = async () => {
  return await axiosInstance.get('/api/admin/leaders');
};

export const getAllStudentsApi = async () => {
  return await axiosInstance.get('/api/admin/students');
};

export const approveLeaderApi = async (leaderId) => {
  return await axiosInstance.put(`/api/admin/approve-leader/${leaderId}`);
};

export const rejectLeaderApi = async (leaderId) => {
  return await axiosInstance.put(`/api/admin/reject-leader/${leaderId}`);
};

export const suspendStudentApi = async (studentId) => {
  return await axiosInstance.put(`/api/admin/students/${studentId}/suspend`);
};

export const cancelStudentApi = async (studentId) => {
  return await axiosInstance.delete(`/api/admin/students/${studentId}`);
};

export const getAdminStatsApi = async () => {
  return await axiosInstance.get('/api/admin/stats');
};

export default axiosInstance;
