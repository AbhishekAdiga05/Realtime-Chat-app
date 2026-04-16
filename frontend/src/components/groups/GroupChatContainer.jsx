import { useEffect, useRef } from "react";
import { GroupChatHeader } from "./GroupChatHeader";
import { GroupMessageInput } from "./GroupMessageInput";
import { GroupMessageList } from "./GroupMessageList";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import { motion } from "framer-motion";

export const GroupChatContainer = () => {
  const { selectedGroup, getGroupMessages, groupMessages } = useGroupStore();
  const { socket } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup && socket) {
      socket.emit("joinGroup", selectedGroup._id);
      getGroupMessages(selectedGroup._id);
    }

    return () => {
      if (socket && selectedGroup) {
        socket.emit("leaveGroup", selectedGroup._id);
      }
    };
  }, [selectedGroup?._id, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  if (!selectedGroup) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200/30"
    >
      <GroupChatHeader />
      <GroupMessageList messagesEndRef={messagesEndRef} />
      <GroupMessageInput />
    </motion.div>
  );
};
