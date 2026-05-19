import axiosInstance from './axiosInstance';

export const getDepartments = async () => {
  const response = await axiosInstance.get('/departments');
  return response.data;
};
