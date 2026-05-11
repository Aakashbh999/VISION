import { MAX_BIO_WORDS } from "../utils/profileHelpers";
import { useProfilePageState } from "../hooks/useProfilePageState";
import ProfileHeaderCard from "../components/ProfileHeaderCard";
import ProfileStatsSidebar from "../components/ProfileStatsSidebar";
import AboutMeCard from "../components/AboutMeCard";
import AcademicBackgroundCard from "../components/AcademicBackgroundCard";
import ProfileImageEditors from "../components/ProfileImageEditors";
import ProfileAvatarModal from "../components/ProfileAvatarModal";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

const ProfilePage = () => {
  const {
    profile,
    isLoading,
    isOwner,
    programs,
    updateAvatarMut,
    updateBannerMut,
    followMut,
    profileUserId,
    isEditMode,
    draftProfile,
    setDraftProfile,
    followDropdownOpen,
    setFollowDropdownOpen,
    followDropdownRef,
    activeEditor,
    setActiveEditor,
    viewingAvatar,
    setViewingAvatar,
    isSavingProfile,
    currentBioWords,
    autoSemester,
    programName,
    handleDraftChange,
    handleEditStart,
    handleEditCancel,
    handleSaveChanges,
    handleAvatarDone,
    handleBannerDone,
    handleFollowToggle,
    systemTags,
    isTagsLoading,
  } = useProfilePageState();

  if (isLoading) {
    return <LoadingSpinner label="Synchronizing your vision profile..." className="min-h-screen" />;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-(--text-muted)">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-12 max-w-5xl mx-auto pb-8">
      <ProfileHeaderCard
        profile={profile}
        isOwner={isOwner}
        isEditMode={isEditMode}
        followDropdownOpen={followDropdownOpen}
        setFollowDropdownOpen={setFollowDropdownOpen}
        followDropdownRef={followDropdownRef}
        followMut={followMut}
        profileUserId={profileUserId}
        handleFollowToggle={handleFollowToggle}
        handleEditStart={handleEditStart}
        setActiveEditor={setActiveEditor}
        setViewingAvatar={setViewingAvatar}
        draftProfile={draftProfile}
        handleDraftChange={handleDraftChange}
        programName={programName}
        handleEditCancel={handleEditCancel}
        handleSaveChanges={handleSaveChanges}
        isSavingProfile={isSavingProfile}
      />

      <ProfileImageEditors
        isOwner={isOwner}
        activeEditor={activeEditor}
        setActiveEditor={setActiveEditor}
        updateAvatarMut={updateAvatarMut}
        updateBannerMut={updateBannerMut}
        handleAvatarDone={handleAvatarDone}
        handleBannerDone={handleBannerDone}
      />

      {}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <AboutMeCard
            profile={profile}
            isOwner={isOwner}
            isEditMode={isEditMode}
            draftProfile={draftProfile}
            currentBioWords={currentBioWords}
            handleDraftChange={handleDraftChange}
            maxBioWords={MAX_BIO_WORDS}
            systemTags={systemTags}
          />

          <AcademicBackgroundCard
            profile={profile}
            programs={programs}
            isOwner={isOwner}
            isEditMode={isEditMode}
            draftProfile={draftProfile}
            autoSemester={autoSemester}
            setDraftProfile={setDraftProfile}
            handleDraftChange={handleDraftChange}
          />
        </div>

        <ProfileStatsSidebar profile={profile} isOwner={isOwner} />
      </div>

      <ProfileAvatarModal
        viewingAvatar={viewingAvatar}
        setViewingAvatar={setViewingAvatar}
        profile={profile}
      />
    </div>
  );
};

export default ProfilePage;
