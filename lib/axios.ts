import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Helper to safely access env variables in browser environments
const getEnv = (key: string, defaultValue: string) => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      return process.env[key] || defaultValue;
    }
    // Check for Vite/other bundler injections if process is missing
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env[key] || defaultValue;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
};

// Enterprise API Configuration
const API_URL = getEnv('REACT_APP_API_URL', 'https://api.talibon.gov.ph/v1');

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