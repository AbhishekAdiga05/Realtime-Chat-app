import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";
import { useGroupStore } from "./useGroupStore";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      localStorage.setItem("chatAppUser", JSON.stringify(res.data));
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      localStorage.setItem("chatAppUser", JSON.stringify(res.data));
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      localStorage.setItem("chatAppUser", JSON.stringify(res.data));
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("chatAppUser");
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, addMessage, updateMessageStatus } = useChatStore.getState();
      if (selectedUser?._id === newMessage.senderId) {
        addMessage(newMessage);
      }
    });

    socket.on("messageStatusUpdate", ({ messageId, status }) => {
      const { updateMessageStatus } = useChatStore.getState();
      updateMessageStatus(messageId, status);
    });

    socket.on("messagesDelivered", ({ messageIds }) => {
      const { updateMessageStatus } = useChatStore.getState();
      messageIds.forEach((id) => updateMessageStatus(id, "delivered"));
    });

    socket.on("messageSeen", ({ messageId, seenAt }) => {
      const { updateMessageStatus } = useChatStore.getState();
      updateMessageStatus(messageId, "seen");
    });

    socket.on("newGroupMessage", ({ groupId, message }) => {
      const { selectedGroup, addGroupMessage, groups } = useGroupStore.getState();
      if (selectedGroup?._id === groupId) {
        addGroupMessage(message);
      }
      useGroupStore.setState({
        groups: groups.map((g) =>
          g._id === groupId ? { ...g, lastMessage: message } : g
        ),
      });
    });

    socket.on("groupUpdated", ({ group }) => {
      const { groups, selectedGroup } = useGroupStore.getState();
      useGroupStore.setState({
        groups: groups.map((g) => (g._id === group._id ? group : g)),
        selectedGroup: selectedGroup?._id === group._id ? group : selectedGroup,
      });
    });

    socket.on("groupMessageSeen", ({ messageId, seenBy }) => {
      const { updateGroupMessageSeen } = useGroupStore.getState();
      updateGroupMessageSeen(messageId, seenBy);
    });

    socket.on("groupDeleted", ({ groupId }) => {
      const { groups, clearSelectedGroup } = useGroupStore.getState();
      useGroupStore.setState({
        groups: groups.filter((g) => g._id !== groupId),
      });
      if (useGroupStore.getState().selectedGroup?._id === groupId) {
        clearSelectedGroup();
      }
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
