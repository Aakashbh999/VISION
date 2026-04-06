import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  usePublicProfile,
  useOwnProfile,
  useUpdateProfile,
  useUpdateProfileImage,
  useUpdateProfileBanner,
  useRemoveProfileImage,
  useRemoveProfileBanner,
  useFollowUser,
} from "../../../hooks/useProfile";
import { usePrograms } from "../../../hooks/usePrograms";
import { showToast } from "../../../utils/toast";
import { calculateSemesterFromBatch } from "../../../utils/academic";
import {
  MAX_BIO_WORDS,
  buildDraftProfile,
  countWords,
} from "../utils/profileHelpers";

export const useProfilePageState = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { data: programs } = usePrograms();

  const currentUserId = currentUser?.id ?? currentUser?.user_id;
  const isOwner = userId === "me" || userId === currentUserId?.toString();

  const { data: ownProfile, isLoading: isOwnLoading } = useOwnProfile({
    enabled: isOwner,
  });
  const { data: publicProfile, isLoading: isPublicLoading } = usePublicProfile(
    isOwner ? null : userId,
  );

  const profile = isOwner ? ownProfile : publicProfile;
  const isLoading = isOwner ? isOwnLoading : isPublicLoading;

  const updateProfileMut = useUpdateProfile();
  const updateAvatarMut = useUpdateProfileImage();
  const updateBannerMut = useUpdateProfileBanner();
  const removeAvatarMut = useRemoveProfileImage();
  const removeBannerMut = useRemoveProfileBanner();
  const followMut = useFollowUser();

  const [isEditMode, setIsEditMode] = useState(false);
  const [draftProfile, setDraftProfile] = useState(buildDraftProfile(null));
  const [followDropdownOpen, setFollowDropdownOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  const [viewingAvatar, setViewingAvatar] = useState(false);

  const followDropdownRef = useRef(null);

  useEffect(() => {
    if (!profile || !isOwner) return;
    setDraftProfile(buildDraftProfile(profile));
  }, [profile, isOwner]);

  useEffect(() => {
    const handler = (event) => {
      if (
        followDropdownRef.current &&
        !followDropdownRef.current.contains(event.target)
      ) {
        setFollowDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isEditMode || draftProfile.semester_is_manual) return;

    const calculatedSemester = calculateSemesterFromBatch(
      draftProfile.batch_year,
    );
    if (!calculatedSemester) return;

    setDraftProfile((currentDraft) => {
      const nextSemester = String(calculatedSemester);
      if (currentDraft.semester === nextSemester) return currentDraft;
      return { ...currentDraft, semester: nextSemester };
    });
  }, [draftProfile.batch_year, draftProfile.semester_is_manual, isEditMode]);

  if (isLoading) {
    return {
      isLoading,
      profile,
    };
  }

  if (!profile) {
    return {
      isLoading,
      profile,
    };
  }

  const isSavingProfile = updateProfileMut.isPending;
  const currentBioWords = countWords(draftProfile.bio);
  const autoSemester = calculateSemesterFromBatch(draftProfile.batch_year);

  const handleDraftChange = (field, value) => {
    setDraftProfile((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const handleEditStart = () => {
    setDraftProfile(buildDraftProfile(profile));
    setIsEditMode(true);
  };

  const handleEditCancel = () => {
    setDraftProfile(buildDraftProfile(profile));
    setIsEditMode(false);
    setActiveEditor(null);
  };

  const handleSaveChanges = async () => {
    if (!draftProfile.full_name.trim()) {
      showToast.error("Full name is required.");
      return;
    }

    if (currentBioWords > MAX_BIO_WORDS) {
      showToast.error(`Bio cannot exceed ${MAX_BIO_WORDS} words.`);
      return;
    }

    if (!draftProfile.semester) {
      showToast.error("Semester is required.");
      return;
    }

    try {
      await updateProfileMut.mutateAsync({
        ...draftProfile,
        batch_year: draftProfile.batch_year || null,
        program_id: draftProfile.program_id || null,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarDone = (formData) => {
    formData.append("use_skip", "true");
    updateAvatarMut.mutate(formData, {
      onSettled: () => {
        setActiveEditor(null);
      },
    });
  };

  const handleBannerDone = (formData) => {
    formData.append("use_skip", "true");
    updateBannerMut.mutate(formData, {
      onSettled: () => {
        setActiveEditor(null);
      },
    });
  };

  const handleFollowToggle = () => {
    followMut.mutate({
      userId: profile.user_id,
      isFollowing: profile.is_following,
    });
  };

  const programName = programs?.find(
    (program) => String(program.program_id) === String(draftProfile.program_id),
  )?.program_name;

  return {
    userId,
    currentUser,
    programs,
    profile,
    isOwner,
    isLoading,
    updateProfileMut,
    updateAvatarMut,
    updateBannerMut,
    removeAvatarMut,
    removeBannerMut,
    followMut,
    isEditMode,
    setIsEditMode,
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
    MAX_BIO_WORDS,
  };
};
