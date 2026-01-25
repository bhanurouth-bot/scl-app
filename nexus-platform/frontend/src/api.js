// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Ensure this matches your backend URL
  withCredentials: true, // <--- CRITICAL: Sends cookies with requests
});

// Response interceptor to handle 401s (Auto Logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // If 401, it means the cookie is invalid or expired
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;