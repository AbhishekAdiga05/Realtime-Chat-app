import { motion } from "framer-motion";

const NoChatSelected = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-base-100 to-base-200/30 p-8"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-32 h-32 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-2xl" />
          <svg
            className="w-full h-full relative"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              className="text-base-300"
            />
            <path
              d="M30 40C30 40 35 35 50 35C65 35 70 40 70 40"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-base-content/30"
            />
            <path
              d="M30 55C30 55 35 60 50 60C65 60 70 55 70 55"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-base-content/30"
            />
            <circle cx="38" cy="47" r="3" fill="currentColor" className="text-primary" />
            <circle cx="50" cy="47" r="3" fill="currentColor" className="text-primary" />
            <circle cx="62" cy="47" r="3" fill="currentColor" className="text-primary" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to ChatVerse
        </h2>
        <p className="text-base-content/60 mb-8">
          Select a conversation from the sidebar or create a new group to start chatting
        </p>

        <div className="flex items-center justify-center gap-4 text-sm text-base-content/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time messaging</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Secure & private</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NoChatSelected;
