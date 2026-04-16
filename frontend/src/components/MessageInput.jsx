import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Loader2 } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    setIsSending(true);
    try {
      await sendMessage({
        receiverId: selectedUser._id,
        text: text.trim(),
        image: imagePreview || "",
      });

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-3 sm:p-4 bg-base-100 border-t border-base-300 w-full z-10 relative">
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="mb-4 relative inline-block p-2 bg-base-200 rounded-2xl border border-base-300 shadow-sm"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 btn btn-circle btn-error btn-xs shadow-md"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="flex-1 flex items-end bg-base-200 rounded-[24px] border border-transparent focus-within:border-primary/30 focus-within:bg-base-100 transition-all shadow-sm">
          {/* Action Left */}
          <div className="flex pb-1 pl-1">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className={`btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/50 hover:text-primary transition-colors ${
                showEmoji ? "text-primary bg-base-300" : ""
              }`}
            >
              <Smile size={22} className="hidden sm:block" />
              <Smile size={20} className="sm:hidden" />
            </button>

            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 sm:left-4 mb-4 z-50 shadow-2xl"
                >
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme="auto"
                    width={typeof window !== 'undefined' && window.innerWidth < 640 ? 300 : 350}
                    height={400}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <textarea
            className="bg-transparent w-full resize-none py-3 sm:py-[14px] px-2 max-h-32 focus:outline-none text-[15px] sm:text-base leading-relaxed placeholder:text-base-content/40"
            placeholder="Message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              height: "48px",
              minHeight: "48px",
            }}
            onInput={(e) => {
              e.target.style.height = "48px";
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
            }}
          />

          {/* Action Right */}
          <div className="flex pb-1 pr-1">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-ghost btn-circle btn-sm sm:btn-md text-base-content/50 hover:text-primary transition-colors"
            >
              <Image size={22} className="hidden sm:block" />
              <Image size={20} className="sm:hidden" />
            </button>
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSendMessage}
          disabled={(!text.trim() && !imagePreview) || isSending}
          className={`btn btn-circle btn-sm sm:btn-md mb-1 shadow-sm transition-all duration-300 ${
            text.trim() || imagePreview
              ? "btn-primary"
              : "bg-base-200 text-base-content/30 border-transparent hover:bg-base-200"
          }`}
        >
          {isSending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default MessageInput;
