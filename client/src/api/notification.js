import axiosInstance from './axiosInstance';

export const getNotifications = () => axiosInstance.get('/notifications').then(r => r.data);
export const markRead = (id) => axiosInstance.put(`/notifications/${id}/read`).then(r => r.data);
export const markAllRead = () => axiosInstance.put('/notifications/read-all').then(r => r.data);
export const deleteNotification = (id) => axiosInstance.delete(`/notifications/${id}`).then(r => r.data);
