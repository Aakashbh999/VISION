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
    tagInput,
    setTagInput,
    specializations,
    degrees,
    availableTags,
    updateMutation,
    handleChange,
    handleAddTag,
    handleRemoveTag,
    handleAddCustomTag,
    handleSubmit,
    getTagName,
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
      tagInput={tagInput}
      setTagInput={setTagInput}
      specializations={specializations}
      degrees={degrees}
      availableTags={availableTags}
      updateMutation={updateMutation}
      onChange={handleChange}
      onAddTag={handleAddTag}
      onRemoveTag={handleRemoveTag}
      onAddCustomTag={handleAddCustomTag}
      onSubmit={handleSubmit}
      getTagName={getTagName}
    />
  );
};

export default EditDiscussionContainer;
