const MessageSkeleton = () => {
  // Create an array of 6 items for skeleton messages
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 sm:space-y-6">
      {skeletonMessages.map((_, idx) => {
        const isOwnMessage = idx % 2 !== 0; // alternate sides
        return (
          <div key={idx} className={`flex gap-2 mb-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            
            {!isOwnMessage && (
              <div className="w-8 flex-shrink-0 flex items-end mb-[2px]">
                <div className="w-8 h-8 rounded-full skeleton" />
              </div>
            )}

            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
              {!isOwnMessage && (
                <div className="skeleton h-3 w-16 mb-1 ml-1 rounded" />
              )}

              <div
                className={`relative group flex flex-col p-4 shadow-sm ${
                  isOwnMessage
                    ? "bg-base-200/50 rounded-[20px] rounded-br-[4px]"
                    : "bg-base-200 rounded-[20px] rounded-bl-[4px]"
                }`}
              >
                <div className={`skeleton h-12 ${idx % 3 === 0 ? "w-[200px]" : "w-[120px]"} rounded-lg opacity-40`} />
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default MessageSkeleton;