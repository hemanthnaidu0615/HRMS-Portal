import axios from 'axios';

const http = axios.create({});

// Request interceptor to add JWT token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure correct Content-Type: JSON by default, but let FormData set its own
    if (config.data instanceof FormData) {
      if (config.headers && 'Content-Type' in config.headers) {
        delete (config.headers as any)['Content-Type'];
      }
    } else {
      if (config.headers) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Permission denied - don't logout, just show error
      console.error('Access denied:', error.response.data);
      // Don't redirect - let the component handle 403
    }
    return Promise.reject(error);
  }
);

export default http;
