import VisionImageEditor from "../../../components/VisionImageEditor";

const ProfileImageEditors = ({
  isOwner,
  activeEditor,
  setActiveEditor,
  updateAvatarMut,
  updateBannerMut,
  handleAvatarDone,
  handleBannerDone,
}) => {
  return (
    <>
      {isOwner && activeEditor === "avatar" && (
        <VisionImageEditor
          aspect={1}
          onDone={handleAvatarDone}
          onCancel={() => setActiveEditor(null)}
          isLoading={updateAvatarMut.isPending}
          asModal
        />
      )}

      {isOwner && activeEditor === "banner" && (
        <VisionImageEditor
          aspect={16 / 9}
          onDone={handleBannerDone}
          onCancel={() => setActiveEditor(null)}
          isLoading={updateBannerMut.isPending}
          asModal
        />
      )}
    </>
  );
};

export default ProfileImageEditors;
