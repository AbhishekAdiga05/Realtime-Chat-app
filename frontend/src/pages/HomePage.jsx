import { useEffect } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useGroupStore } from "../store/useGroupStore";
import { GroupSidebar } from "../components/groups/GroupSidebar";
import ChatContainer from "../components/ChatContainer";
import { GroupChatContainer } from "../components/groups/GroupChatContainer";
import NoChatSelected from "../components/NoChatSelected";

const HomePage = () => {
  const { selectedUser, getUsers } = useChatStore();
  const { checkAuth } = useAuthStore();
  const { selectedGroup, getGroups } = useGroupStore();

  useEffect(() => {
    checkAuth();
    getUsers();
    getGroups();
  }, []);

  return (
    <div className="flex h-screen bg-base-100">
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: selectedUser || selectedGroup ? -100 : 0 }}
        className={`w-full lg:w-80 flex-shrink-0 border-r border-base-300 h-full ${
          selectedUser || selectedGroup ? "hidden lg:flex" : "flex"
        }`}
      >
        <GroupSidebar />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col h-full"
      >
        {selectedUser ? (
          <ChatContainer />
        ) : selectedGroup ? (
          <GroupChatContainer />
        ) : (
          <NoChatSelected />
        )}
      </motion.div>
    </div>
  );
};

export default HomePage;
