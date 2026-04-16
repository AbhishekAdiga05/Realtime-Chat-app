import { useEffect } from "react";
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
  }, [checkAuth, getUsers, getGroups]);

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4 sm:px-6 h-full pb-4 sm:pb-6">
        <div className="bg-base-100 w-full max-w-6xl h-full shadow-2xl rounded-2xl flex overflow-hidden border border-base-300">
          
          {/* Sidebar - Hidden on mobile if chat is active */}
          <div
            className={`w-full lg:w-80 flex-shrink-0 border-r border-base-300 transition-all duration-300 ${
              selectedUser || selectedGroup ? "hidden lg:flex" : "flex"
            }`}
          >
            <GroupSidebar />
          </div>

          {/* Chat Area - Hidden on mobile if NO chat is active */}
          <div
            className={`flex-1 transition-all duration-300 ${
              !selectedUser && !selectedGroup ? "hidden lg:flex" : "flex flex-col"
            }`}
          >
            {selectedUser ? (
              <ChatContainer />
            ) : selectedGroup ? (
              <GroupChatContainer />
            ) : (
              <NoChatSelected />
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default HomePage;
