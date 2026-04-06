import { X } from "lucide-react";

const ProfileAvatarModal = ({ viewingAvatar, setViewingAvatar, profile }) => {
  if (!viewingAvatar) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={() => setViewingAvatar(false)}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          setViewingAvatar(false);
        }}
        className="absolute top-4 left-4 bg-white/10 hover:bg-white/25 text-white p-2.5 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        className="flex flex-col items-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        {profile.profile_image ? (
          <img
            src={profile.profile_image}
            alt={profile.full_name}
            className="max-w-[88vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        ) : (
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
            <span className="text-8xl font-bold text-white">
              {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        )}
        <p className="text-white/70 text-sm font-medium">{profile.full_name}</p>
      </div>
    </div>
  );
};

export default ProfileAvatarModal;
