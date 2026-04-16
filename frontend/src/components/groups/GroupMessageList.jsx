import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { useAuthStore } from "../../store/useAuthStore";
import { useGroupStore } from "../../store/useGroupStore";
import MessageSkeleton from "../skeletons/MessageSkeleton";

export const GroupMessageList = ({ messagesEndRef }) => {
  const { authUser } = useAuthStore();
  const { groupMessages, isMessagesLoading, hasMoreMessages, getGroupMessages, selectedGroup } = useGroupStore();
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (containerRef.current && containerRef.current.scrollTop === 0 && hasMoreMessages && !isMessagesLoading) {
      getGroupMessages(selectedGroup._id, selectedGroup.currentPage + 1);
    }
  };

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [groupMessages]);

  if (isMessagesLoading && groupMessages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    );
  }

  if (groupMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-base-300 flex items-center justify-center">
            <span className="text-3xl">{selectedGroup.name.charAt(0).toUpperCase()}</span>
          </div>
          <p className="text-base-content/60">No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {isMessagesLoading && groupMessages.length > 0 && (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-sm" />
        </div>
      )}

      {groupMessages.map((message, index) => {
        const isOwnMessage = message.senderId?._id === authUser?._id;
        const showAvatar = !isOwnMessage && (
          index === 0 ||
          groupMessages[index - 1]?.senderId?._id !== message.senderId?._id
        );

        return (
          <div
            key={message._id}
            className={`flex gap-2 ${isOwnMessage ? "justify-end" : ""}`}
          >
            {!isOwnMessage && (
              <div className="w-8 flex-shrink-0">
                {showAvatar ? (
                  <img
                    src={message.senderId?.profilePic || "/avatar.png"}
                    alt={message.senderId?.fullName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8" />
                )}
              </div>
            )}

            <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-1" : ""}`}>
              {showAvatar && !isOwnMessage && (
                <div className="text-xs text-base-content/60 mb-1 ml-1">
                  {message.senderId?.fullName}
                </div>
              )}

              <div
                className={`chat ${
                  isOwnMessage ? "chat-end" : "chat-start"
                }`}
              >
                <div className="chat-bubble chat-bubble-primary">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="rounded mb-2 max-w-[200px] cursor-pointer hover:opacity-90"
                      onClick={() => window.open(message.image, "_blank")}
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>

              <div
                className={`text-xs text-base-content/50 mt-1 ${
                  isOwnMessage ? "text-right mr-1" : "text-left ml-1"
                }`}
              >
                {format(new Date(message.createdAt), "HH:mm")}
                {isOwnMessage && message.seenBy && message.seenBy.length > 1 && (
                  <span className="ml-2 text-primary">
                    {message.seenBy.length - 1} seen
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};
