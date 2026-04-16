import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Pencil, X, Check } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImg(reader.result);
    };
  };

  const handleApply = async () => {
    if (!previewImg) return;
    setSelectedImg(previewImg);
    await updateProfile({ profilePic: previewImg });
    setPreviewImg(null);
  };

  const handleEditName = () => {
    setEditName(authUser.fullName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === authUser.fullName) {
      setIsEditingName(false);
      return;
    }
    if (editName.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    await updateProfile({ fullName: editName.trim() });
    setIsEditingName(false);
  };

  const handleEditEmail = () => {
    setEditEmail(authUser.email);
    setIsEditingEmail(true);
  };

  const handleSaveEmail = async () => {
    if (!editEmail.trim() || editEmail === authUser.email) {
      setIsEditingEmail(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    await updateProfile({ email: editEmail.trim() });
    setIsEditingEmail(false);
  };

  return (
    <div className="h-screen-full pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={
                  previewImg ||
                  selectedImg ||
                  authUser.profilePic ||
                  "/avatar.png"
                }
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            {previewImg && (
              <button
                className="btn btn-primary btn-sm mt-2"
                onClick={handleApply}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? "Uploading..." : "Apply"}
              </button>
            )}
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile
                ? "Uploading..."
                : previewImg
                  ? "Preview your new photo, then click Apply."
                  : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setIsEditingName(false);
                    }}
                  />
                  <button
                    onClick={handleSaveName}
                    className="btn btn-primary btn-sm"
                    disabled={isUpdatingProfile}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 rounded-lg border group">
                  <p>{authUser?.fullName}</p>
                  <button
                    onClick={handleEditName}
                    className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              {isEditingEmail ? (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-base-200 rounded-lg border border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEmail();
                      if (e.key === "Escape") setIsEditingEmail(false);
                    }}
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="btn btn-primary btn-sm"
                    disabled={isUpdatingProfile}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingEmail(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-2.5 bg-base-200 rounded-lg border group">
                  <p>{authUser?.email}</p>
                  <button
                    onClick={handleEditEmail}
                    className="opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
