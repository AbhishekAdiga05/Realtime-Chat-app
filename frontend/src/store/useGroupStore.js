import { create } from "zustand";
import { groupService } from "../services/groupService";
import { messageStatusService } from "../services/messageStatusService";

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isMessagesLoading: false,
  isCreating: false,
  hasMoreMessages: true,
  currentPage: 1,

  createGroup: async (data) => {
    set({ isCreating: true });
    try {
      const group = await groupService.createGroup(data);
      set((state) => ({
        groups: [group, ...state.groups],
        isCreating: false,
      }));
      return group;
    } catch (error) {
      set({ isCreating: false });
      throw error;
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const groups = await groupService.getMyGroups();
      set({ groups, isGroupsLoading: false });
    } catch (error) {
      set({ isGroupsLoading: false });
      throw error;
    }
  },

  selectGroup: (group) => {
    set({
      selectedGroup: group,
      groupMessages: [],
      currentPage: 1,
      hasMoreMessages: true,
    });
  },

  getGroupMessages: async (groupId, page = 1) => {
    if (page === 1) {
      set({ isMessagesLoading: true });
    }

    try {
      const data = await groupService.getGroupMessages(groupId, page);

      set((state) => ({
        groupMessages: page === 1
          ? data.messages
          : [...data.messages, ...state.groupMessages],
        hasMoreMessages: page < data.totalPages,
        currentPage: page,
        isMessagesLoading: false,
      }));
    } catch (error) {
      set({ isMessagesLoading: false });
      throw error;
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    try {
      const message = await groupService.sendGroupMessage(groupId, messageData);

      set((state) => ({
        groupMessages: [...state.groupMessages, message],
        groups: state.groups.map((g) =>
          g._id === groupId
            ? { ...g, lastMessage: message }
            : g
        ),
      }));

      return message;
    } catch (error) {
      throw error;
    }
  },

  addGroupMessage: (message) => {
    set((state) => {
      const exists = state.groupMessages.find((m) => m._id === message._id);
      if (exists) return state;
      return { groupMessages: [...state.groupMessages, message] };
    });
  },

  updateGroupMessageSeen: (messageId, seenByUser) => {
    set((state) => ({
      groupMessages: state.groupMessages.map((m) => {
        if (m._id === messageId) {
          const alreadySeen = m.seenBy?.some(
            (s) => s.user === seenByUser.user || s.user?._id === seenByUser.user
          );
          if (alreadySeen) return m;
          return {
            ...m,
            seenBy: [...(m.seenBy || []), seenByUser],
          };
        }
        return m;
      }),
    }));
  },

  markGroupMessagesAsSeen: async (messageIds) => {
    try {
      await messageStatusService.markAsSeen(messageIds);
      const userId = JSON.parse(localStorage.getItem("chatAppUser"))?._id;
      if (userId) {
        set((state) => ({
          groupMessages: state.groupMessages.map((m) =>
            messageIds.includes(m._id)
              ? {
                  ...m,
                  seenBy: [
                    ...(m.seenBy || []),
                    { user: userId, seenAt: new Date() },
                  ],
                }
              : m
          ),
        }));
      }
    } catch (error) {
      console.error("Failed to mark group messages as seen:", error);
    }
  },

  addMemberToGroup: async (groupId, userId) => {
    try {
      const updatedGroup = await groupService.addMember(groupId, userId);
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId ? updatedGroup : g
        ),
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? updatedGroup
            : state.selectedGroup,
      }));
    } catch (error) {
      throw error;
    }
  },

  removeMemberFromGroup: async (groupId, userId) => {
    try {
      const updatedGroup = await groupService.removeMember(groupId, userId);
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId ? updatedGroup : g
        ),
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? updatedGroup
            : state.selectedGroup,
      }));
    } catch (error) {
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await groupService.leaveGroup(groupId);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? null
            : state.selectedGroup,
      }));
    } catch (error) {
      throw error;
    }
  },

  updateGroupInStore: async (groupId, data) => {
    try {
      const updatedGroup = await groupService.updateGroup(groupId, data);
      set((state) => ({
        groups: state.groups.map((g) =>
          g._id === groupId ? updatedGroup : g
        ),
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? updatedGroup
            : state.selectedGroup,
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await groupService.deleteGroup(groupId);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedGroup:
          state.selectedGroup?._id === groupId
            ? null
            : state.selectedGroup,
      }));
    } catch (error) {
      throw error;
    }
  },

  clearSelectedGroup: () => {
    set({ selectedGroup: null, groupMessages: [] });
  },
}));
