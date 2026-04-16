import { useState } from "react";
import { X, Plus, Check } from "lucide-react";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-base-100 rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {step === 1 ? "Create Group" : "Add Members"}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {step === 1 ? (
            <>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Group Name *</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-medium">Description (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="What's this group about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-base-content/60">
                Select at least 2 members to add ({selectedMembers.length} selected)
              </p>

              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => toggleMember(user._id)}
                    className={`w-full p-3 flex items-center gap-3 rounded-lg border transition-colors ${
                      selectedMembers.includes(user._id)
                        ? "border-primary bg-primary/10"
                        : "border-base-300 hover:bg-base-200"
                    }`}
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        <img src={user.profilePic || "/avatar.png"} alt="" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{user.fullName}</div>
                      <div className="text-xs text-base-content/60">{user.email}</div>
                    </div>
                    {selectedMembers.includes(user._id) && (
                      <Check className="text-primary" size={20} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-base-300 flex gap-2 justify-end">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="btn btn-ghost">
              Back
            </button>
          )}
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              disabled={!name.trim()}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="btn btn-primary"
              disabled={selectedMembers.length < 2 || isCreating}
            >
              {isCreating ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                `Create (${selectedMembers.length + 1} members)`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
