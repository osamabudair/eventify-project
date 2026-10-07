import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: automatically attaches Bearer token to outbound requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: handle 401/403 responses by clearing localStorage and redirecting to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

      // Do not clear and redirect on auth endpoint failures (e.g., incorrect credentials)
      if (!isAuthEndpoint) {
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

const formatEvent = (ev) => {
  if (!ev) return null;
  const formattedTime = (ev.startTime && ev.endTime) 
    ? `${ev.startTime} - ${ev.endTime}` 
    : (ev.time || "10:00 AM - 02:00 PM");

  const attendeesNum = ev.approvedAttendees ?? ev.approvedCount ?? (Array.isArray(ev.attendees) ? ev.attendees.length : ev.attendees) ?? 0;

  return {
    ...ev,
    _id: ev.id,
    id: ev.id,
    title: ev.name || ev.title,
    name: ev.name || ev.title,
    date: ev.date,
    startTime: ev.startTime,
    endTime: ev.endTime,
    time: formattedTime,
    approvedAttendees: attendeesNum,
    approvedCount: attendeesNum,
    attendees: attendeesNum,
    maxAttendees: ev.capacity || ev.maxAttendees || 100,
    capacity: ev.capacity || ev.maxAttendees || 100,
    image: ev.imageUrl || ev.image || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
    imageUrl: ev.imageUrl || ev.image,
    organizer: {
      username: ev.organizerName || ev.organizer?.username || "University Club",
      name: ev.organizerName || ev.organizer?.username || "University Club"
    },
    organizerName: ev.organizerName || ev.organizer?.username || "University Club"
  };
};

// ==================== 1. Auth ====================
export const loginApi = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response;
};

export const registerApi = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response;
};

// ==================== 2. Events & Explore ====================
export const getAllEventsApi = async () => {
  const res = await axiosInstance.get('/events/explore');
  return { ...res, data: Array.isArray(res.data) ? res.data.map(formatEvent) : [] };
};

export const getUpcomingHighlightsApi = async () => {
  const res = await axiosInstance.get('/events/upcoming-highlights');
  return { ...res, data: Array.isArray(res.data) ? res.data.map(formatEvent) : [] };
};

export const getEventByIdApi = async (id) => {
  const res = await axiosInstance.get(`/events/${id}`);
  const data = res.data;

  const orgName = 
    data.organizer?.name || 
    data.organizer?.fullName || 
    data.organizer?.username || 
    data.organizerName || 
    "University Club";

  const formatted = {
    ...data,
    id: data.id,
    _id: data.id,
    title: data.name,
    name: data.name,
    club: orgName,
    organizerName: orgName,
    organizer: {
      name: orgName,
      username: orgName
    }
  };

  return { ...res, data: formatted };
};

export const getEventApprovedCountApi = async (eventId) => {
  const res = await axiosInstance.get(`/registrations/event/${eventId}/approved`);
  const data = res.data;
  if (Array.isArray(data)) return data.length;
  return data && typeof data === 'object' && (data.registrationId || data.id) ? 1 : 0;
};

export const createEventApi = async (eventData) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizerId = user.id || user._id;
  return await axiosInstance.post('/events', {
    ...eventData,
    organizerId
  });
};

export const updateEventApi = async (id, eventData) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const organizerId = user.id || user._id;
  return await axiosInstance.put(`/events/${id}`, {
    ...eventData,
    organizerId
  });
};

export const deleteEventApi = async (id) => {
  return await axiosInstance.delete(`/events/${id}`);
};

export const getMyEventsApi = async (organizerId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const id = organizerId || user.id || user._id;
  const res = await axiosInstance.get(`/events/user/${id}`);
  return { ...res, data: Array.isArray(res.data) ? res.data.map(formatEvent) : [] };
};

// ==================== 3. Leader Dashboard & Registrations ====================
export const getOrganizerRegistrationsApi = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const leaderId = user.id || user._id;

  const res = await axiosInstance.get(`/registrations/leader/${leaderId}/pending`);
  
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
  const res = await axiosInstance.get(`/leader/${leaderId}/dashboard`);
  return res.data;
};

export const updateRegistrationStatusApi = async (registrationId, status) => {
  const action = status.toLowerCase();
  
  if (action === 'approved' || action === 'approve') {
    return await axiosInstance.put(`/registrations/${registrationId}/approve`);
  } else if (action === 'rejected' || action === 'reject') {
    return await axiosInstance.put(`/registrations/${registrationId}/reject`);
  } else if (action === 'cancelled' || action === 'cancel') {
    return await axiosInstance.put(`/registrations/${registrationId}/cancel`);
  }
};

// ==================== 4. Student Portal & Tickets ====================
export const registerForEventApi = async (eventId) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.id || user._id;
  return await axiosInstance.post(`/registrations/apply/${eventId}/student/${studentId}`);
};

export const getMyRegistrationsApi = async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const studentId = user.id || user._id;
  const res = await axiosInstance.get(`/registrations/student/${studentId}/dashboard`);
  
  const formattedTickets = (res.data.tickets || []).map(t => {
    const realAppliedOn = t.appliedOn || t.registrationDate || t.createdAt;

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
        startTime: t.startTime,
        endTime: t.endTime,
        time: (t.startTime && t.endTime) ? `${t.startTime} - ${t.endTime}` : "10:00 AM - 02:00 PM",
        location: t.location || "Amman",
        category: t.category || "General",
        organizerName: t.organizerName || "Club Leader"
      }
    };
  });

  return { ...res, data: formattedTickets };
};

export const cancelRegistrationApi = async (registrationId) => {
  return await axiosInstance.put(`/registrations/${registrationId}/cancel`);
};

// ==================== 5. Profile ====================
export const updateProfileApi = async (payload) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user._id;
  
  const requestBody = {
    name: payload.fullName || payload.name,
    currentPassword: payload.current || payload.currentPassword || null,
    newPassword: payload.new || payload.newPassword || null,
    confirmNewPassword: payload.confirm || payload.confirmNewPassword || payload.new || null
  };

  const res = await axiosInstance.put(`/users/${userId}/profile`, requestBody);
  
  return {
    data: {
      message: "Profile updated successfully!",
      user: {
        ...user,
        username: res.data.name || requestBody.name,
        name: res.data.name || requestBody.name,
        email: res.data.email || user.email
      }
    }
  };
};

export default axiosInstance;