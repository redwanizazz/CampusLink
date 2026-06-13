import axiosInstance from './axiosInstance';

export const getFeed = () => axiosInstance.get('/posts/feed').then(r => r.data);
export const createPost = (data) => axiosInstance.post('/posts', data).then(r => r.data);
export const getPost = (id) => axiosInstance.get(`/posts/${id}`).then(r => r.data);
export const deletePost = (id) => axiosInstance.delete(`/posts/${id}`).then(r => r.data);
export const toggleLike = (id) => axiosInstance.post(`/posts/${id}/like`).then(r => r.data);
export const addComment = (id, content) => axiosInstance.post(`/posts/${id}/comments`, { content }).then(r => r.data);
export const reportPost = (id, reason) => axiosInstance.post(`/posts/${id}/report`, { reason }).then(r => r.data);
