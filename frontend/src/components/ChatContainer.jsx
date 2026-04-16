import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import { Check, CheckCheck, Search, X } from "lucide-react";

const ChatContainer = ({ onSearchClick }) => {
  const { selectedUser, messages, getMessages, isMessagesLoading, markMessagesAsSeen } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser || messages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const unseenMessages = messages
            .filter((m) => m.senderId?._id !== selectedUser._id && m.status !== "seen")
            .map((m) => m._id);
          if (unseenMessages.length > 0) {
            markMessagesAsSeen(unseenMessages);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }

    return () => observer.disconnect();
  }, [messages, selectedUser]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleSearchToggle = useCallback(() => {
    setShowSearch((prev) => !prev);
    if (!showSearch) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [showSearch]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !selectedUser) return;

    setIsSearching(true);
    try {
      const res = await axiosInstance.get(`/messages/search/${selectedUser._id}?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleSearchResultClick = (message) => {
    const element = document.getElementById(`message-${message._id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-primary/20");
      setTimeout(() => {
        element.classList.remove("bg-primary/20");
      }, 1500);
    }
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  if (!selectedUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200/30"
    >
      <ChatHeader onSearchClick={handleSearchToggle} />

      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-base-200/80 border-b border-base-300 overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="input input-sm input-bordered w-full pl-9 pr-4"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-base-content/50" />
                    </button>
                  )}
                </div>
                <button onClick={handleSearchToggle} className="btn btn-ghost btn-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isSearching && (
                <div className="mt-2 text-center">
                  <span className="loading loading-spinner loading-sm text-primary"></span>
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  <p className="text-xs text-base-content/50 px-1 mb-1">
                    {searchResults.length} result{searchResults.length > 1 ? "s" : ""} found
                  </p>
                  {searchResults.slice(0, 10).map((msg) => (
                    <button
                      key={msg._id}
                      onClick={() => handleSearchResultClick(msg)}
                      className="w-full text-left p-2 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={msg.senderId?.profilePic || "/avatar.png"}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {msg.senderId?.fullName}
                          </p>
                          <p className="text-xs text-base-content/60 truncate">
                            {msg.text}
                          </p>
                        </div>
                        <span className="text-[10px] text-base-content/50">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <p className="mt-2 text-center text-sm text-base-content/50 py-2">
                  No messages found
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {isMessagesLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className="h-16 bg-base-300 rounded-2xl w-64 animate-pulse" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyChat selectedUser={selectedUser} />
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwnMessage={message.senderId?._id === authUser?._id}
              showAvatar={
                !message.senderId ||
                index === 0 ||
                messages[index - 1]?.senderId?._id !== message.senderId?._id
              }
              sender={message.senderId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </motion.div>
  );
};

const MessageBubble = ({ message, isOwnMessage, showAvatar, sender }) => {
  const isHighlighted = message._id;

  return (
    <motion.div
      id={`message-${message._id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-1.5 sm:gap-2 mb-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && (
        <div className="w-6 sm:w-8 flex-shrink-0 flex items-end mb-[2px]">
          {showAvatar ? (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-base-300 shadow-sm">
              <img
                src={sender?.profilePic || "/avatar.png"}
                alt={sender?.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-6 sm:w-8" />
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
        {showAvatar && !isOwnMessage && (
          <span className="text-[11px] text-base-content/50 ml-1 mb-1 font-medium tracking-wide">
            {sender?.fullName}
          </span>
        )}

        <div
          className={`relative group flex flex-col px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm text-[15px] sm:text-base leading-snug ${
            isOwnMessage
              ? "bg-primary text-primary-content rounded-[20px] rounded-br-[4px]"
              : "bg-base-200 text-base-content rounded-[20px] rounded-bl-[4px]"
          }`}
        >
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="rounded-xl mb-1.5 max-w-[200px] sm:max-w-[260px] object-cover cursor-pointer hover:opacity-[0.85] transition-opacity border border-black/10 shadow-sm"
              onClick={() => window.open(message.image, "_blank")}
            />
          )}

          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            {message.text && (
              <span className="whitespace-pre-wrap break-words">{message.text}</span>
            )}
            
            <div
              className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-medium opacity-70 ml-auto whitespace-nowrap translate-y-[2px] ${
                isOwnMessage ? "text-primary-content" : "text-base-content"
              }`}
            >
              <span>{formatTime(message.createdAt)}</span>
              {isOwnMessage && (
                <span className="flex items-center">
                  {message.status === "sent" && <Check size={12} strokeWidth={3} />}
                  {message.status === "delivered" && (
                    <span className="flex -space-x-[6px]">
                      <Check size={12} strokeWidth={3} />
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                  {message.status === "seen" && (
                    <span className="flex -space-x-[6px]">
                      <CheckCheck size={14} className="text-white drop-shadow-sm" />
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyChat = ({ selectedUser }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8 space-y-4"
  >
    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative rounded-full overflow-hidden border-4 border-base-200 shadow-xl">
      <img
        src={selectedUser?.profilePic || "/avatar.png"}
        alt={selectedUser?.fullName}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="bg-base-200/50 backdrop-blur border border-base-300 px-6 py-5 rounded-2xl max-w-sm shadow-sm">
      <h3 className="text-lg font-semibold text-base-content mb-2 tracking-tight">
        Say hi to {selectedUser?.fullName.split(" ")[0]}! 👋
      </h3>
      <p className="text-sm text-base-content/60 leading-relaxed">
        This is the beginning of your direct message history. Send a secure message below to start the conversation!
      </p>
    </div>
  </motion.div>
);

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default ChatContainer;
