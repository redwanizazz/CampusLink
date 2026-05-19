import axiosInstance from './axiosInstance';

export const discoverUsers = async () => {
  const response = await axiosInstance.get('/connections/discover');
  return response.data;
};

export const sendRequest = async (addresseeId) => {
  const response = await axiosInstance.post('/connections/request', { addressee_id: addresseeId });
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await axiosInstance.get('/connections/pending');
  return response.data;
};

export const acceptRequest = async (connectionId) => {
  const response = await axiosInstance.put(`/connections/request/${connectionId}/accept`);
  return response.data;
};

export const rejectRequest = async (connectionId) => {
  const response = await axiosInstance.delete(`/connections/request/${connectionId}/reject`);
  return response.data;
};

export const getConnections = async () => {
  const response = await axiosInstance.get('/connections');
  return response.data;
};

export const removeConnection = async (connectionId) => {
  const response = await axiosInstance.delete(`/connections/${connectionId}`);
  return response.data;
};
