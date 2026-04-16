import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Check, CheckCheck } from "lucide-react";

const ChatContainer = () => {
  const { selectedUser, messages, getMessages, isMessagesLoading, markMessagesAsSeen } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

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

  if (!selectedUser) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200/30"
    >
      <ChatHeader />

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
  return (
    <motion.div
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
            
            {/* Inline Timestamp and Read Receipts */}
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
