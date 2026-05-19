import axiosInstance from './axiosInstance';

export const getChats = async () => {
  const response = await axiosInstance.get('/chats');
  return response.data;
};

export const getMessages = async (chatId, limit = 50, offset = 0) => {
  const response = await axiosInstance.get(`/chats/${chatId}/messages`, {
    params: { limit, offset }
  });
  return response.data;
};

export const getChatByUserId = async (userId) => {
  const response = await axiosInstance.get(`/chats/user/${userId}`);
  return response.data;
};
