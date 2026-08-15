import axiosInstance from './axiosInstance';

export const getStats = () => axiosInstance.get('/admin/stats').then(r => r.data);
export const getAnalytics = () => axiosInstance.get('/admin/analytics').then(r => r.data);

export const getAdminUsers = (params) => axiosInstance.get('/admin/users', { params }).then(r => r.data);
export const updateUserRole = (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role }).then(r => r.data);
export const verifyUser = (id) => axiosInstance.put(`/admin/users/${id}/verify`).then(r => r.data);
export const deleteAdminUser = (id) => axiosInstance.delete(`/admin/users/${id}`).then(r => r.data);

export const getReports = (status) => axiosInstance.get('/admin/reports', { params: status ? { status } : {} }).then(r => r.data);
export const resolveReport = (id) => axiosInstance.put(`/admin/reports/${id}/resolve`).then(r => r.data);
export const dismissReport = (id) => axiosInstance.put(`/admin/reports/${id}/dismiss`).then(r => r.data);
export const deleteReportedPost = (id) => axiosInstance.delete(`/admin/reports/${id}/post`).then(r => r.data);
