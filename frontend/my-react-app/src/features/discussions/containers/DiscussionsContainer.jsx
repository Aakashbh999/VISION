import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { useDiscussions } from "../../../hooks/useDiscussionHooks";
import ImageLightbox from "../../../components/modals/ImageLightbox";
import DiscussionsHeader from "../components/DiscussionsHeader";
import DiscussionsList from "../components/DiscussionsList";
import { useDiscussionFilters } from "../hooks/useDiscussionFilters";
import { useDiscussionActions } from "../hooks/useDiscussionActions";
import { useDiscussionReferenceData } from "../hooks/useDiscussionReferenceData";

const DiscussionsContainer = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    image: null,
    title: "",
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { filters, updateFilter } = useDiscussionFilters();
  const { programs } = useDiscussionReferenceData();
  const { data, isLoading, error } = useDiscussions(filters);
  const {
    loadingLike,
    loadingSave,
    handleLike,
    handleDownvote,
    handleSave,
    handleShare,
  } = useDiscussionActions({ user, queryClient });

  const openLightbox = (image, title) => {
    setLightbox({ isOpen: true, image, title });
  };

  const discussions = data?.discussions || [];

  return (
    <div className="max-w-[824px] lg:max-w-[980px] xl:max-w-[1120px] mx-auto space-y-4 px-0 sm:px-6 lg:px-8 pb-5 sm:pb-8 lg:pb-10">
      <ImageLightbox
        isOpen={lightbox.isOpen}
        image={lightbox.image}
        title={lightbox.title}
        onClose={() => setLightbox({ ...lightbox, isOpen: false })}
      />

      <DiscussionsHeader
        user={user}
        filters={filters}
        programs={programs}
        isLoading={isLoading}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        onUpdateFilter={updateFilter}
      />

      <div className="space-y-4 min-h-[400px] px-0 sm:px-0">
        <DiscussionsList
          isLoading={isLoading}
          error={error}
          data={data}
          filters={filters}
          discussions={discussions}
          user={user}
          loadingLike={loadingLike}
          loadingSave={loadingSave}
          onLike={handleLike}
          onDownvote={handleDownvote}
          onSave={handleSave}
          onShare={handleShare}
          onImageClick={openLightbox}
        />
      </div>
    </div>
  );
};

export default DiscussionsContainer;
