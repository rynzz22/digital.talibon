
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Enterprise API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://api.talibon.gov.ph/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10s timeout
});

// Request Interceptor: Inject JWT Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('lgu_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global Error Handling & Auto-Logout
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized (Expired Token)
      if (error.response.status === 401) {
        localStorage.removeItem('lgu_token');
        localStorage.removeItem('lgu_user');
        window.location.href = '/login?expired=true';
      }
      
      // Handle 403 Forbidden (RBAC violation)
      if (error.response.status === 403) {
        console.error('Access Forbidden: Insufficient Permissions');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
