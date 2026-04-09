import CreateDiscussionForm from "../components/create/CreateDiscussionForm";
import CreateDiscussionSidebar from "../components/create/CreateDiscussionSidebar";
import { useCreateDiscussionState } from "../hooks/useCreateDiscussionState";

const CreateDiscussionContainer = () => {
  const state = useCreateDiscussionState();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <CreateDiscussionForm
            fileInputRef={state.fileInputRef}
            activeTab={state.activeTab}
            setActiveTab={state.setActiveTab}
            formData={state.formData}
            setFormData={state.setFormData}
            selectedFile={state.selectedFile}
            previewUrl={state.previewUrl}
            specializations={state.specializations}
            systemTagOptions={state.systemTagOptions}
            isLoadingTags={state.isLoadingTags}
            customTagInput={state.customTagInput}
            setCustomTagInput={state.setCustomTagInput}
            toggleSystemTag={state.toggleSystemTag}
            addCustomTag={state.addCustomTag}
            removeCustomTag={state.removeCustomTag}
            handleCustomTagKeyDown={state.handleCustomTagKeyDown}
            uploading={state.uploading}
            createMutation={state.createMutation}
            onFileSelect={state.handleFileSelect}
            onRemoveFile={state.removeFile}
            onDragOver={state.handleDragOver}
            onDrop={state.handleDrop}
            onSubmit={state.handleSubmit}
          />
        </div>

        <CreateDiscussionSidebar />
      </div>
    </div>
  );
};

export default CreateDiscussionContainer;
