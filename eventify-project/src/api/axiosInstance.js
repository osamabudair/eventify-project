import axios from 'axios';

// إنشاء نسخة axios موحدة
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // رابط سيرفر الـ Node.js
  headers: {
    'Content-Type': 'application/json'
  }
});

// دالة تسجيل الدخول
export const loginApi = (data) => API.post('/auth/login', data);

// دالة إنشاء حساب جديد
export const registerApi = (data) => API.post('/auth/register', data);

export default API;