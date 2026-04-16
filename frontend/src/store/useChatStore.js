import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true, messages: [] });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    try {
      const res = await axiosInstance.post(`/messages/send/${messageData.receiverId}`, {
        text: messageData.text,
        image: messageData.image,
      });
      set((state) => ({
        messages: [...state.messages, res.data],
      }));
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      throw error;
    }
  },

  addMessage: (message) => {
    set((state) => {
      const exists = state.messages.find((m) => m._id === message._id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    });
  },

  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, status } : m
      ),
    }));
  },

  markMessagesAsSeen: async (messageIds) => {
    try {
      await axiosInstance.post("/messages/seen", { messageIds });
      set((state) => ({
        messages: state.messages.map((m) =>
          messageIds.includes(m._id)
            ? { ...m, status: "seen", seenAt: new Date() }
            : m
        ),
      }));
    } catch (error) {
      console.error("Failed to mark as seen:", error);
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),
}));
