import axiosInstance from './axiosInstance';

export const getNotices = (params) => axiosInstance.get('/notices', { params }).then(r => r.data);
export const getNotice = (id) => axiosInstance.get(`/notices/${id}`).then(r => r.data);
export const createNotice = (data) => axiosInstance.post('/notices', data).then(r => r.data);
export const deleteNotice = (id) => axiosInstance.delete(`/notices/${id}`).then(r => r.data);
