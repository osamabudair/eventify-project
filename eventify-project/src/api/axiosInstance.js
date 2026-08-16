// --- Imports ---
import axios from 'axios';

// --- Axios Instance Setup ---
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// --- Request Interceptor (Attach Auth Token) ---
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// --- Auth APIs ---
export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);

// --- Events APIs ---
export const createEventApi = (data) => API.post('/events', data);
export const getAllEventsApi = () => API.get('/events');
export const getMyEventsApi = () => API.get('/events/me');
export const deleteEventApi = (id) => API.delete(`/events/${id}`);
export const getEventByIdApi = (id) => API.get(`/events/${id}`);
export const registerForEventApi = (id) => API.post(`/events/${id}/register`);
export const updateEventApi = (id, data) => API.put(`/events/${id}`, data); 

// --- Registrations APIs ---
export const getOrganizerRegistrationsApi = () => API.get('/events/registrations/manage');
export const updateRegistrationStatusApi = (id, status) => API.put(`/events/registrations/${id}`, { status });
export const getMyRegistrationsApi = () => API.get('/events/registrations/my-tickets');
export const cancelRegistrationApi = (id) => API.delete(`/events/registrations/${id}`);

// --- Profile APIs ---
export const updateProfileApi = (data) => API.put('/auth/profile', data);

export default API;