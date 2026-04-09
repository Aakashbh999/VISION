import EditDiscussionForm from "../components/edit/EditDiscussionForm";
import {
  EditDiscussionError,
  EditDiscussionExpired,
  EditDiscussionLoading,
} from "../components/edit/EditDiscussionStateViews";
import { useEditDiscussionState } from "../hooks/useEditDiscussionState";

const EditDiscussionContainer = () => {
  const {
    id,
    isLoading,
    error,
    canEdit,
    formData,
    errors,
    customTagInput,
    setCustomTagInput,
    specializations,
    degrees,
    systemTagOptions,
    isLoadingTags,
    updateMutation,
    handleChange,
    toggleSystemTag,
    addCustomTag,
    removeCustomTag,
    handleCustomTagKeyDown,
    handleSubmit,
  } = useEditDiscussionState();

  if (isLoading) {
    return <EditDiscussionLoading />;
  }

  if (error) {
    return <EditDiscussionError />;
  }

  if (!canEdit) {
    return <EditDiscussionExpired discussionId={id} />;
  }

  return (
    <EditDiscussionForm
      id={id}
      formData={formData}
      errors={errors}
      customTagInput={customTagInput}
      setCustomTagInput={setCustomTagInput}
      specializations={specializations}
      degrees={degrees}
      systemTagOptions={systemTagOptions}
      isLoadingTags={isLoadingTags}
      updateMutation={updateMutation}
      onChange={handleChange}
      toggleSystemTag={toggleSystemTag}
      addCustomTag={addCustomTag}
      removeCustomTag={removeCustomTag}
      handleCustomTagKeyDown={handleCustomTagKeyDown}
      onSubmit={handleSubmit}
    />
  );
};

export default EditDiscussionContainer;
