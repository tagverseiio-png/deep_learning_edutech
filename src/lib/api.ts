import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API base URL - use environment variable or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'edutech_access_token';
const REFRESH_TOKEN_KEY = 'edutech_refresh_token';

// Production flag
const IS_PRODUCTION = import.meta.env.PROD;

// Token management utilities
export const tokenStorage = {
  getAccessToken: (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string): void => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  removeAccessToken: (): void => localStorage.removeItem(ACCESS_TOKEN_KEY),
  
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  removeRefreshToken: (): void => localStorage.removeItem(REFRESH_TOKEN_KEY),
  
  clearTokens: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Logger utility for production monitoring
const logger = {
  error: (message: string, error: any, context?: any) => {
    if (IS_PRODUCTION) {
      // In production, you can send to error tracking service (Sentry, etc.)
      console.error(`[ERROR] ${message}`, error, context);
    } else {
      console.error(message, error, context);
    }
  },
  warn: (message: string, context?: any) => {
    if (!IS_PRODUCTION) {
      console.warn(message, context);
    }
  },
  info: (message: string, context?: any) => {
    if (!IS_PRODUCTION) {
      console.log(message, context);
    }
  },
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds for better stability
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Network timeout or no response
    if (!error.response) {
      logger.error('Network error - no response from server', error, { url: originalRequest?.url });
      return Promise.reject(error);
    }

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          const { token } = response.data.data;
          tokenStorage.setAccessToken(token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          logger.error('Token refresh failed', refreshError);
          tokenStorage.clearTokens();
          window.location.href = '/';
          return Promise.reject(refreshError);
        }
      }
    }

    // Log errors for debugging
    const errorData = error.response?.data as any;
    logger.error('API Error', error, { 
      status: error.response?.status,
      message: errorData?.message,
      url: originalRequest?.url,
    });
    
    return Promise.reject(error);
  }
);

export default api;

// Export base URL for external use
export { API_BASE_URL };
