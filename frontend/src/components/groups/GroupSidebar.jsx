import { useState } from "react";
import { Users, MessageSquare, Search, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";
import { CreateGroupModal } from "./CreateGroupModal";

export const GroupSidebar = () => {
  const [activeTab, setActiveTab] = useState("chats");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const { users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { groups, selectedGroup, selectGroup, isGroupsLoading, clearSelectedGroup } = useGroupStore();
  const { onlineUsers } = useAuthStore();

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (user) => {
    clearSelectedGroup();
    setSelectedUser(user);
  };

  const handleSelectGroup = (group) => {
    selectGroup(group);
  };

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header Section */}
      <div className="p-4 pb-3 border-b border-base-300 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="btn btn-ghost btn-sm btn-circle bg-base-200 hover:bg-base-300"
            title="Create Group"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
          <input
            type="text"
            className="input input-sm h-10 input-bordered w-full pl-10 bg-base-200/50 focus:bg-base-200 border-none rounded-xl"
            placeholder={activeTab === "chats" ? "Search chats..." : "Search groups..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Segmented Control Tabs */}
        <div className="bg-base-200 p-1 rounded-lg flex items-center gap-1">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === "chats"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
            }`}
          >
            <MessageSquare size={16} />
            Chats
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === "groups"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
            }`}
          >
            <Users size={16} />
            Groups
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-hidden bg-base-100/50">
        <AnimatePresence mode="wait">
          {activeTab === "chats" ? (
            <motion.div
              key="chats"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto p-2"
            >
              {isUsersLoading ? (
                <SidebarSkeleton />
              ) : filteredUsers.length === 0 ? (
                <EmptyState type="users" />
              ) : (
                <div className="space-y-[2px]">
                  {filteredUsers.map((user, index) => (
                    <ChatItem
                      key={user._id}
                      user={user}
                      isSelected={selectedUser?._id === user._id}
                      onClick={() => handleSelectChat(user)}
                      isOnline={onlineUsers.includes(user._id)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="groups"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-y-auto p-2"
            >
              {isGroupsLoading ? (
                <SidebarSkeleton />
              ) : filteredGroups.length === 0 ? (
                <EmptyState type="groups" onCreate={() => setShowCreateGroup(true)} />
              ) : (
                <div className="space-y-[2px]">
                  {filteredGroups.map((group, index) => (
                    <GroupItem
                      key={group._id}
                      group={group}
                      isSelected={selectedGroup?._id === group._id}
                      onClick={() => handleSelectGroup(group)}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showCreateGroup && (
        <CreateGroupModal isOpen={true} onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  );
};

const ChatItem = ({ user, isSelected, onClick, isOnline, index }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${
        isSelected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-base-100/80 border border-transparent"
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="avatar">
          <div className="w-12 h-12 rounded-full">
            <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
          </div>
        </div>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-base-200 animate-pulse" />
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="font-semibold truncate">{user.fullName}</div>
        <div className="text-sm text-base-content/60 truncate">
          {isOnline ? "Online" : "Offline"}
        </div>
      </div>
    </motion.button>
  );
};

const GroupItem = ({ group, isSelected, onClick, index }) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${
        isSelected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-base-100/80 border border-transparent"
      }`}
    >
      <div className="avatar placeholder flex-shrink-0">
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-12">
          <span className="text-lg font-bold">{group.name.charAt(0).toUpperCase()}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="font-semibold truncate flex items-center gap-2">
          {group.name}
          {group.members?.length > 0 && (
            <span className="badge badge-ghost badge-sm">{group.members.length}</span>
          )}
        </div>
        <div className="text-sm text-base-content/60 truncate">
          {group.lastMessage
            ? `${group.lastMessage.senderId?.fullName || "You"}: ${
                group.lastMessage.text || "Shared an image"
              }`
            : "No messages yet"}
        </div>
      </div>
      {group.lastMessage && (
        <span className="text-xs text-base-content/40 flex-shrink-0">
          {formatTimeAgo(group.lastMessage.createdAt)}
        </span>
      )}
    </motion.button>
  );
};

const EmptyState = ({ type, onCreate }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
    <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center mb-4">
      {type === "groups" ? (
        <Users size={32} className="text-base-content/40" />
      ) : (
        <MessageSquare size={32} className="text-base-content/40" />
      )}
    </div>
    <h3 className="font-semibold text-base-content/80 mb-2">
      {type === "groups" ? "No groups yet" : "No conversations"}
    </h3>
    <p className="text-sm text-base-content/50 mb-4">
      {type === "groups"
        ? "Create a group to start chatting with multiple people"
        : "Start a conversation by selecting a user"}
    </p>
    {type === "groups" && (
      <button onClick={onCreate} className="btn btn-primary btn-sm">
        <Plus size={16} />
        Create Group
      </button>
    )}
  </div>
);

const formatTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diff = now - past;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return past.toLocaleDateString();
};
