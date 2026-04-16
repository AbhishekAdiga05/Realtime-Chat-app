import { ArrowLeft, MoreVertical, Phone, Video, Search, X, User as UserIcon, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const ChatHeader = ({ onBack, onSearchClick }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const isOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  const handleViewContact = async () => {
    setShowMenu(false);
    setIsLoadingDetails(true);
    setShowContactModal(true);
    try {
      const res = await axiosInstance.get(`/auth/users/${selectedUser._id}`);
      setUserDetails(res.data);
    } catch (error) {
      toast.error("Failed to load user details");
      setShowContactModal(false);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleBlockUser = async () => {
    setIsBlocking(true);
    try {
      await axiosInstance.put(`/auth/block/${selectedUser._id}`);
      toast.success(`Blocked ${selectedUser.fullName}`);
      setSelectedUser(null);
      setShowBlockConfirm(false);
      setShowMenu(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to block user");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleSearchClick = () => {
    setShowMenu(false);
    if (onSearchClick) onSearchClick();
  };

  return (
    <>
      <div className="h-[72px] px-4 sm:px-6 flex items-center justify-between bg-base-100 border-b border-base-300 w-full z-10 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-circle btn-sm -ml-2 lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>

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

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleSearchClick}
            className="btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/70 hover:text-primary"
          >
            <Search size={20} />
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
                    <button onClick={handleSearchClick} className="flex items-center gap-3">
                      <Search size={16} />
                      Search messages
                    </button>
                  </li>
                  <li>
                    <button onClick={handleViewContact} className="flex items-center gap-3">
                      <UserIcon size={16} />
                      View contact
                    </button>
                  </li>
                  <div className="divider my-0"></div>
                  <li>
                    <button
                      onClick={() => { setShowMenu(false); setShowBlockConfirm(true); }}
                      className="flex items-center gap-3 text-error"
                    >
                      <ShieldAlert size={16} />
                      Block user
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-base-100 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Contact Info</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="btn btn-ghost btn-circle btn-sm"
                >
                  <X size={18} />
                </button>
              </div>

              {isLoadingDetails ? (
                <div className="flex flex-col items-center py-6">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : userDetails ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-base-200 mb-4">
                    <img
                      src={userDetails.profilePic || "/avatar.png"}
                      alt={userDetails.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-xl font-bold mb-1">{userDetails.fullName}</h4>
                  <p className="text-base-content/60 text-sm mb-4">{userDetails.email}</p>
                  <div className="w-full space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-t border-base-200">
                      <span className="text-base-content/60">Status</span>
                      <span className={isOnline ? "text-green-500" : "text-base-content/50"}>
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-base-200">
                      <span className="text-base-content/60">Member since</span>
                      <span>{userDetails.createdAt?.split("T")[0]}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBlockConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowBlockConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-base-100 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-2">Block {selectedUser?.fullName}?</h3>
              <p className="text-base-content/60 text-sm mb-6">
                You will not be able to send or receive messages from this user. You can unblock them anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="btn btn-ghost flex-1"
                  disabled={isBlocking}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  className="btn btn-error flex-1"
                  disabled={isBlocking}
                >
                  {isBlocking ? <span className="loading loading-spinner loading-sm"></span> : "Block"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatHeader;
