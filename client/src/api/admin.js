import axiosInstance from './axiosInstance';

export const getStats = () => axiosInstance.get('/admin/stats').then(r => r.data);
export const getAdminUsers = (params) => axiosInstance.get('/admin/users', { params }).then(r => r.data);
export const updateUserRole = (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role }).then(r => r.data);
export const verifyUser = (id) => axiosInstance.put(`/admin/users/${id}/verify`).then(r => r.data);
export const deleteAdminUser = (id) => axiosInstance.delete(`/admin/users/${id}`).then(r => r.data);
