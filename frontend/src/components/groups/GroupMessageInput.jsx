import { useState, useRef } from "react";
import { Send, Image, Smile, X, Loader2 } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGroupStore } from "../../store/useGroupStore";

export const GroupMessageInput = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);

  const { selectedGroup, sendGroupMessage } = useGroupStore();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!text.trim() && !image) || !selectedGroup) return;

    setIsSending(true);
    const messageData = {
      text: text.trim(),
      image: image || "",
    };

    try {
      setText("");
      removeImage();
      await sendGroupMessage(selectedGroup._id, messageData);
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="p-4 border-t border-base-300 bg-gradient-to-t from-base-100 to-base-200/50">
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-3 relative inline-block"
          >
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border-2 border-base-300"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 btn btn-circle btn-error btn-xs"
            >
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            className="textarea textarea-bordered w-full resize-none py-3 pr-12 min-h-[48px] max-h-32"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            style={{
              height: "auto",
              minHeight: "48px",
              maxHeight: "128px",
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
            }}
          />

          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
          >
            <Smile size={20} />
          </button>

          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-2"
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  theme="dark"
                  width={300}
                  height={350}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
        >
          <Image size={20} />
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={(!text.trim() && !image) || isSending}
          className="btn btn-primary btn-circle"
        >
          {isSending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </motion.button>
      </div>
    </div>
  );
};
