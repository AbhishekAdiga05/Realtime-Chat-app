import { useState } from "react";
import { X, Check, Users, AlignLeft, Search, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "../../store/useChatStore";
import { useGroupStore } from "../../store/useGroupStore";
import toast from "react-hot-toast";

export const CreateGroupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { users } = useChatStore();
  const { createGroup, isCreating } = useGroupStore();

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedMembers.length < 2) {
      toast.error("Select at least 2 members");
      return;
    }

    try {
      await createGroup({
        name: name.trim(),
        description: description.trim(),
        members: selectedMembers,
      });
      toast.success("Group created!");
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create group");
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedMembers([]);
    setStep(1);
    setSearchQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-base-100 rounded-[28px] w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-base-300/50"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-base-200 flex items-center justify-between bg-base-100 relative z-20">
              <h2 className="text-xl font-bold tracking-tight">
                {step === 1 ? "New Group" : "Add Members"}
              </h2>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(resetForm, 300);
                }}
                className="btn btn-ghost btn-sm btn-circle bg-base-200 hover:bg-base-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="px-6 py-6 overflow-y-auto flex-1 relative z-10 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Decorative Icon */}
                    <div className="flex justify-center mb-2">
                      <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center border-4 border-base-100 shadow-sm relative group cursor-pointer transition-all hover:bg-base-300">
                        <Camera size={32} className="text-base-content/40 group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100 hidden group-hover:block" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-base-content/80 ml-1">Group Name</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                          <input
                            type="text"
                            className="input w-full pl-11 bg-base-200 border-transparent focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl h-12"
                            placeholder="e.g. Weekend Trip, Work Team..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-base-content/80 ml-1">Description <span className="font-normal opacity-50">(optional)</span></label>
                        <div className="relative">
                          <AlignLeft className="absolute left-4 top-4 text-base-content/40" size={18} />
                          <textarea
                            className="textarea w-full pl-11 pt-4 bg-base-200 border-transparent focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl resize-none h-24"
                            placeholder="What's this group about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={200}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Selected Members Pill Row */}
                    {selectedMembers.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-base-300 py-1">
                        {selectedMembers.map((id) => {
                          const user = users.find((u) => u._id === id);
                          if (!user) return null;
                          return (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={id}
                              className="flex flex-col items-center gap-1 min-w-[4.5rem] relative"
                            >
                              <div className="relative">
                                <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-12 h-12 rounded-full object-cover border-2 border-base-100 shadow-sm" />
                                <button
                                  onClick={() => toggleMember(id)}
                                  className="absolute -top-1 -right-1 bg-base-300 text-base-content rounded-full p-0.5 shadow-sm hover:bg-error hover:text-white transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                              <span className="text-[10px] sm:text-xs font-medium truncate w-full text-center opacity-80">
                                {user.fullName.split(" ")[0]}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
                      <input
                        type="text"
                        className="input w-full pl-11 bg-base-200 border-transparent focus:bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl h-11 text-sm"
                        placeholder="Search contacts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1 mt-2">
                      {filteredUsers.length === 0 ? (
                        <p className="text-center text-sm text-base-content/50 py-4">No contacts found</p>
                      ) : (
                        filteredUsers.map((user) => {
                          const isSelected = selectedMembers.includes(user._id);
                          return (
                            <button
                              key={user._id}
                              onClick={() => toggleMember(user._id)}
                              className={`w-full p-2.5 flex items-center gap-3 rounded-xl transition-all group ${
                                isSelected
                                  ? "bg-primary/5 hover:bg-primary/10"
                                  : "hover:bg-base-200"
                              }`}
                            >
                              <div className="relative">
                                <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="font-semibold text-sm tracking-tight">{user.fullName}</div>
                              </div>
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected ? "bg-primary border-primary text-primary-content" : "border-base-300 group-hover:border-primary/50"
                              }`}>
                                {isSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-base-200 bg-base-100 flex justify-between items-center z-20">
              <div className="text-sm font-medium text-base-content/60">
                {step === 2 && (
                  <span className={selectedMembers.length < 2 ? "text-error" : "text-success"}>
                    {selectedMembers.length} selected
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="btn btn-ghost rounded-xl">
                    Back
                  </button>
                )}
                {step === 1 ? (
                  <button
                    onClick={() => setStep(2)}
                    className="btn btn-primary rounded-xl px-6 shadow-sm"
                    disabled={!name.trim()}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleCreate}
                    className="btn btn-primary rounded-xl px-6 shadow-sm"
                    disabled={selectedMembers.length < 2 || isCreating}
                  >
                    {isCreating ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Create Group"
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
