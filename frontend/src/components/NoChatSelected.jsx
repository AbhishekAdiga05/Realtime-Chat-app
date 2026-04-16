import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-base-100/50 p-4 sm:p-8 relative overflow-hidden h-full">
      {/* Decorative Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="text-center max-w-sm relative z-10 transition-all">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-base-200 rounded-3xl flex items-center justify-center text-primary/40 shadow-sm border border-base-300 transform -rotate-3 transition-transform hover:rotate-0 duration-300">
          <MessageSquare size={40} className="sm:w-12 sm:h-12" />
        </div>

        <h2 className="text-2xl font-bold mb-2 tracking-tight text-base-content">
          ChatVerse for Web
        </h2>
        <p className="text-[15px] text-base-content/60 mb-8 leading-relaxed">
          Select a conversation from the sidebar to start chatting. Ensure your device has an active connection.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[13px] text-base-content/50 font-medium">
          <div className="flex items-center gap-2 bg-base-200/50 px-3 py-1.5 rounded-full border border-base-300/50">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            End-to-End Encrypted
          </div>
          <div className="flex items-center gap-2 bg-base-200/50 px-3 py-1.5 rounded-full border border-base-300/50">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
            Real-time Sync
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
