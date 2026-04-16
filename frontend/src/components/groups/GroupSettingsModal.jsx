import { useState } from "react";
import { X, Crown, UserMinus, Trash2, Edit2 } from "lucide-react";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

export const GroupSettingsModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("members");
  const [showAddMember, setShowAddMember] = useState(false);

  const { selectedGroup, removeMemberFromGroup, leaveGroup, deleteGroup, updateGroupInStore } = useGroupStore();
  const { authUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = selectedGroup?.createdBy?._id === authUser?._id;

  const handleRemoveMember = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from group?`)) return;
    try {
      await removeMemberFromGroup(selectedGroup._id, userId);
      toast.success("Member removed");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove member");
    }
  };

  const handleLeave = async () => {
    if (!confirm("Leave this group?")) return;
    try {
      await leaveGroup(selectedGroup._id);
      toast.success("Left group");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to leave");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this group permanently?")) return;
    try {
      await deleteGroup(selectedGroup._id);
      toast.success("Group deleted");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete");
    }
  };

  const handleUpdate = async (data) => {
    setIsUpdating(true);
    try {
      await updateGroupInStore(selectedGroup._id, data);
      toast.success("Group updated");
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg font-semibold">Group Settings</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-base-300">
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 py-2 ${activeTab === "members" ? "border-b-2 border-primary text-primary" : ""}`}
          >
            Members
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 py-2 ${activeTab === "settings" ? "border-b-2 border-primary text-primary" : ""}`}
            >
              Settings
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "members" ? (
            <div className="space-y-2">
              {selectedGroup?.members?.map((member) => (
                <div
                  key={member.user._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200"
                >
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={member.user.profilePic || "/avatar.png"}
                        alt={member.user.fullName}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {member.user.fullName}
                      {member.user._id === selectedGroup.createdBy?._id && (
                        <Crown size={14} className="text-yellow-500" />
                      )}
                    </div>
                    <div className="text-xs text-base-content/60">
                      {member.role}
                    </div>
                  </div>
                  {isAdmin && member.user._id !== selectedGroup.createdBy?._id && (
                    <button
                      onClick={() => handleRemoveMember(member.user._id, member.user.fullName)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <UserMinus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <GroupEditForm group={selectedGroup} onUpdate={handleUpdate} isUpdating={isUpdating} />
          )}
        </div>

        <div className="p-4 border-t border-base-300 flex gap-2">
          {!isAdmin && (
            <button onClick={handleLeave} className="btn btn-warning flex-1">
              Leave Group
            </button>
          )}
          {isAdmin && (
            <button onClick={handleDelete} className="btn btn-error flex-1">
              <Trash2 size={16} />
              Delete Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const GroupEditForm = ({ group, onUpdate, isUpdating }) => {
  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ name, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">
          <span className="label-text">Group Name</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={isUpdating}>
        {isUpdating ? <span className="loading loading-spinner" /> : "Save Changes"}
      </button>
    </form>
  );
};
