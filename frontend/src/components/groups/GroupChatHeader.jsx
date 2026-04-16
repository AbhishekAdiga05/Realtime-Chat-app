import { ArrowLeft, MoreVertical, Users, Crown, Settings } from "lucide-react";
import { useState } from "react";
import { useGroupStore } from "../../store/useGroupStore";
import { useAuthStore } from "../../store/useAuthStore";
import { GroupSettingsModal } from "./GroupSettingsModal";

export const GroupChatHeader = ({ onBack }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();

  const isAdmin = selectedGroup?.createdBy?._id === authUser?._id;

  return (
    <div className="h-16 px-4 flex items-center justify-between bg-gradient-to-r from-base-100 to-base-200/50 border-b border-base-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="btn btn-ghost btn-sm btn-circle lg:hidden">
          <ArrowLeft size={20} />
        </button>

        <div className="avatar placeholder">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full w-10">
            <span>{selectedGroup?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>

        <div>
          <div className="font-semibold flex items-center gap-2">
            {selectedGroup?.name}
            {isAdmin && <Crown size={14} className="text-yellow-500" />}
          </div>
          <div className="text-xs text-base-content/60">
            {selectedGroup?.members?.length} members
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 w-48 bg-base-200 rounded-lg shadow-lg border border-base-300 py-1 z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowSettings(true);
                }}
                className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-2"
              >
                <Users size={16} />
                View Members
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowSettings(true);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-base-300 flex items-center gap-2"
                >
                  <Settings size={16} />
                  Edit Group
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showSettings && (
        <GroupSettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};
