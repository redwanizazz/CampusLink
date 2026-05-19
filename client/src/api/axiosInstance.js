import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send the refreshToken cookie on every request
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Queue of requests that arrived while a refresh was in flight
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Never retry the refresh or logout endpoints themselves
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout')
    ) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Park this request until the refresh resolves
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axiosInstance.post('/auth/refresh');
      const { accessToken } = data;
      useAuthStore.getState().setToken(accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
