import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor: بيشتغل قبل أي طلب وبضيف التوكن إذا كان موجود
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const loginApi = (data) => API.post('/auth/login', data);
export const registerApi = (data) => API.post('/auth/register', data);

// Events APIs
export const createEventApi = (data) => API.post('/events', data);
export const getAllEventsApi = () => API.get('/events');
export const getMyEventsApi = () => API.get('/events/me');
export const deleteEventApi = (id) => API.delete(`/events/${id}`);

export default API;