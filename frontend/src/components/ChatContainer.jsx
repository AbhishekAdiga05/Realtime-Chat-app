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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      {!isOwnMessage && (
        <div className="w-8 flex-shrink-0">
          {showAvatar ? (
            <img
              src={sender?.profilePic || "/avatar.png"}
              alt={sender?.fullName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      <div className={`max-w-[75%] ${isOwnMessage ? "order-1" : ""}`}>
        {showAvatar && !isOwnMessage && (
          <div className="text-xs text-base-content/60 mb-1 ml-1 font-medium">
            {sender?.fullName}
          </div>
        )}

        <div className={`relative group flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
          <div
            className={`chat-bubble ${
              isOwnMessage
                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-2xl rounded-br-md"
                : "bg-base-200 rounded-2xl rounded-bl-md"
            } px-4 py-2.5`}
          >
            {message.image && (
              <img
                src={message.image}
                alt="Attachment"
                className="rounded-lg mb-2 max-w-[200px] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.image, "_blank")}
              />
            )}
            {message.text && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
            )}
          </div>

          <div className={`flex items-center gap-1 mt-1 text-[10px] text-base-content/50 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <span>{formatTime(message.createdAt)}</span>
            {isOwnMessage && (
              <span className="ml-1">
                {message.status === "sent" && <Check size={12} />}
                {message.status === "delivered" && (
                  <span className="flex -space-x-1">
                    <Check size={12} />
                    <Check size={12} />
                  </span>
                )}
                {message.status === "seen" && (
                  <span className="flex -space-x-1 text-success">
                    <CheckCheck size={12} />
                    <CheckCheck size={12} />
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmptyChat = ({ selectedUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full text-center p-8"
  >
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="w-24 h-24 mx-auto mb-8 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl" />
      <img
        src={selectedUser?.profilePic || "/avatar.png"}
        alt={selectedUser?.fullName}
        className="w-full h-full rounded-full object-cover relative"
      />
    </motion.div>
    <h3 className="text-xl font-bold mb-2">Start a conversation</h3>
    <p className="text-base-content/60 max-w-xs">
      Send a message to{" "}
      <span className="font-semibold text-base-content">{selectedUser?.fullName}</span>{" "}
      and start chatting!
    </p>
  </motion.div>
);

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default ChatContainer;
