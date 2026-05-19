import axiosInstance from './axiosInstance';

export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};

export const refreshToken = async () => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};
