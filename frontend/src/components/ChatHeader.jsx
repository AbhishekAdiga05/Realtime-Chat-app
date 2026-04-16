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
    <div className="h-[72px] px-4 sm:px-6 flex items-center justify-between bg-base-100 border-b border-base-300 w-full z-10 shadow-sm">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Back Button */}
        <button
          onClick={onBack}
          className="btn btn-ghost btn-circle btn-sm -ml-2 lg:hidden"
        >
          <ArrowLeft size={20} />
        </button>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-base-200 shadow-sm">
              <img
                src={selectedUser?.profilePic || "/avatar.png"}
                alt={selectedUser?.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-base-100" />
            )}
          </div>

          <div className="flex flex-col">
            <h2 className="font-semibold text-base tracking-tight leading-tight">
              {selectedUser?.fullName}
            </h2>
            <p className="text-[13px] text-base-content/60 mt-0.5 font-medium">
              {isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button className="btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/70 hover:text-primary">
          <Phone size={20} />
        </button>
        <button className="btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/70 hover:text-primary">
          <Video size={20} />
        </button>
        <div className="dropdown dropdown-end">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/70 hover:text-primary transition-colors ${
              showMenu ? "bg-base-200 text-primary" : ""
            }`}
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <ul className="dropdown-content z-50 menu p-2 shadow-xl bg-base-100 rounded-xl w-52 border border-base-300 mt-2">
                <li>
                  <button className="flex items-center gap-3">
                    <Search size={16} />
                    Search messages
                  </button>
                </li>
                <li>
                  <button className="flex items-center gap-3">
                    View contact
                  </button>
                </li>
                <div className="divider my-0"></div>
                <li>
                  <button className="flex items-center gap-3 text-error">
                    Block user
                  </button>
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
