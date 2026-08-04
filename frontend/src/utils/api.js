import axios from 'axios';

let rawBase = import.meta.env.VITE_API_BASE_URL || '';
if (rawBase.endsWith('/')) {
  rawBase = rawBase.slice(0, -1);
}
if (rawBase.endsWith('/api/v1')) {
  rawBase = rawBase.slice(0, -7);
}

const baseURL = rawBase ? `${rawBase}/api/v1` : '/api/v1';

const API = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request Interceptor: Attach JWT Token if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuslink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('campuslink_token');
      localStorage.removeItem('campuslink_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
