import { ArrowLeft, MoreVertical, Phone, Video, Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const ChatHeader = ({ onBack }) => {
  const { selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  return (
    <div className="h-16 px-4 flex items-center justify-between bg-gradient-to-r from-base-100 to-base-200/50 border-b border-base-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm btn-circle lg:hidden"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="relative">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="avatar"
          >
            <div className="w-10 h-10 rounded-full">
              <img
                src={selectedUser?.profilePic || "/avatar.png"}
                alt={selectedUser?.fullName}
              />
            </div>
          </motion.div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100 animate-pulse" />
          )}
        </div>

        <div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-semibold"
          >
            {selectedUser?.fullName}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-base-content/60"
          >
            {isOnline ? "Online" : "Offline"}
          </motion.p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
          <Phone size={18} />
        </button>
        <button className="btn btn-ghost btn-sm btn-circle hover:bg-base-300">
          <Video size={18} />
        </button>
        <div className="dropdown dropdown-end">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="btn btn-ghost btn-sm btn-circle hover:bg-base-300"
          >
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
              <ul className="dropdown-content z-50 menu p-2 shadow-lg bg-base-200 rounded-xl w-48 border border-base-300">
                <li>
                  <button className="flex items-center gap-2">
                    <Search size={16} />
                    Search messages
                  </button>
                </li>
                <li>
                  <button>Clear chat</button>
                </li>
                <li>
                  <button className="text-error">Block user</button>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
