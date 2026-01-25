import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Ensure this matches your Django port
  withCredentials: true, // <--- CRITICAL: This sends the HttpOnly cookies
});

// Response interceptor to handle 401s (Auto Logout)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("Session expired or invalid. Logging out...");
      
      // Clear the UI flag we use for the PrivateRoute
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user'); // Clear user data too
      
      // Force redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;