import { axiosInstance as axios } from "../lib/axios.js";

export const messageStatusService = {
  markAsSeen: async (messageIds) => {
    const res = await axios.post("/messages/seen", { messageIds });
    return res.data;
  },

  getMessageStatus: async (messageId) => {
    const res = await axios.get(`/messages/status/${messageId}`);
    return res.data;
  },
};
