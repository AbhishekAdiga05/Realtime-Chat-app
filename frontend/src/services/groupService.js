import { axiosInstance as axios } from "../lib/axios.js";

export const groupService = {
  createGroup: async (data) => {
    const res = await axios.post("/groups", data);
    return res.data;
  },

  getMyGroups: async () => {
    const res = await axios.get("/groups");
    return res.data;
  },

  getGroupById: async (groupId) => {
    const res = await axios.get(`/groups/${groupId}`);
    return res.data;
  },

  updateGroup: async (groupId, data) => {
    const res = await axios.put(`/groups/${groupId}`, data);
    return res.data;
  },

  deleteGroup: async (groupId) => {
    const res = await axios.delete(`/groups/${groupId}`);
    return res.data;
  },

  addMember: async (groupId, userId) => {
    const res = await axios.post(`/groups/${groupId}/members`, { userId });
    return res.data;
  },

  removeMember: async (groupId, userId) => {
    const res = await axios.delete(`/groups/${groupId}/members/${userId}`);
    return res.data;
  },

  leaveGroup: async (groupId) => {
    const res = await axios.post(`/groups/${groupId}/leave`);
    return res.data;
  },

  getGroupMessages: async (groupId, page = 1) => {
    const res = await axios.get(`/groups/${groupId}/messages?page=${page}`);
    return res.data;
  },

  sendGroupMessage: async (groupId, data) => {
    const res = await axios.post(`/messages/group/${groupId}`, data);
    return res.data;
  },
};
