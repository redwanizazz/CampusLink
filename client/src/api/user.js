import axiosInstance from './axiosInstance';

export const getProfile = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosInstance.put('/users/profile', data);
  return response.data;
};

export const uploadAvatar = async (formData) => {
  const response = await axiosInstance.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const changePassword = async (data) => {
  const response = await axiosInstance.put('/users/password', data);
  return response.data;
};
