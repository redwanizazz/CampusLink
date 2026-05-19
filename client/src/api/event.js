import axiosInstance from './axiosInstance';

export const getEvents = (params) => axiosInstance.get('/events', { params }).then(r => r.data);
export const getEvent = (id) => axiosInstance.get(`/events/${id}`).then(r => r.data);
export const createEvent = (data) => axiosInstance.post('/events', data).then(r => r.data);
export const updateEvent = (id, data) => axiosInstance.put(`/events/${id}`, data).then(r => r.data);
export const deleteEvent = (id) => axiosInstance.delete(`/events/${id}`).then(r => r.data);
export const rsvpEvent = (id, status) => axiosInstance.post(`/events/${id}/rsvp`, { status }).then(r => r.data);
export const getMyEvents = () => axiosInstance.get('/events/my-events').then(r => r.data);
