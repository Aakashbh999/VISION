import React, { useState } from "react";
import {
  X,
  Upload,
  File as FileIcon,
  Link as LinkIcon,
  Lightbulb,
} from "lucide-react";
import { useUploadResource } from "../../hooks/useUploadResource";
import TagSelectorSection from "../ui/TagSelectorSection";
import { useSystemTags } from "../../hooks/useSystemTags";
import { useDiscussionReferenceData } from "../../features/discussions/hooks/useDiscussionReferenceData";
import { AcademicProgramFilter } from "../lib";
import { toggleCappedSelection } from "../../utils/tagSelection";
import { getApiErrorMessage } from "../../utils/apiError";

const SYSTEM_TAG_CAP = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = "10MB";

const ResourceUploadModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "notes",
    semester: "",
    program_id: "",
    url: "",
    system_tags: [],
  });
  const { programs } = useDiscussionReferenceData();
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState("");
  const uploadMutation = useUploadResource();
  const { systemTagOptions, isLoadingTags } = useSystemTags(isOpen);
  const isFileTooLarge = Boolean(file && file.size > MAX_FILE_SIZE_BYTES);
  const canSubmit =
    !uploadMutation.isPending &&
    !!formData.title.trim() &&
    (formData.resource_type === "link"
      ? !!formData.url.trim()
      : !!file && !isFileTooLarge);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (localError) setLocalError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setFile(selectedFile);
      setLocalError(
        `File is too large. Please choose a file smaller than ${MAX_FILE_SIZE_LABEL}.`,
      );
      return;
    }

    if (localError) setLocalError("");
    setFile(selectedFile);
  };

  const toggleSystemTag = (tagId) => {
    setFormData((prev) => {
      const nextSystemTags = toggleCappedSelection(
        prev.system_tags,
        tagId,
        SYSTEM_TAG_CAP,
      );
      return { ...prev, system_tags: nextSystemTags };
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      resource_type: "notes",
      semester: "",
      program_id: "",
      url: "",
      system_tags: [],
    });
    setFile(null);
    setLocalError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (uploadMutation.isPending) return;

    if (!formData.title.trim()) {
      setLocalError("Title is required.");
      return;
    }

    if (formData.resource_type !== "link" && !file) {
      setLocalError("Please upload a file or switch to External Link.");
      return;
    }

    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setLocalError(
        `File is too large. Please choose a file smaller than ${MAX_FILE_SIZE_LABEL}.`,
      );
      return;
    }

    if (formData.resource_type === "link" && !formData.url.trim()) {
      setLocalError("Please enter a valid URL.");
      return;
    }

    setLocalError("");

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("resource_type", formData.resource_type);

    if (formData.semester) submitData.append("semester", formData.semester);
    if (formData.program_id)
      submitData.append("program_id", formData.program_id);

    if (formData.system_tags.length > 0) {
      submitData.append("system_tags", JSON.stringify(formData.system_tags));
    }

    if (formData.resource_type === "link") {
      submitData.append("url", formData.url);
    } else if (file) {
      submitData.append("file", file);
    } else {
      submitData.append("url", formData.url);
    }

    uploadMutation.mutate(submitData, {
      onSuccess: () => {
        resetForm();
        onClose();
      },
      onError: (error) => {
        setLocalError(getApiErrorMessage(error, "Failed to upload resource"));
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-(--bg-card) rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {}
        <div className="flex justify-between items-center p-6 border-b border-(--border-main) sticky top-0 bg-(--bg-card)/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-(--text-main)">
            Share a Resource
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-(--bg-active) rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-(--text-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {localError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {localError}
            </div>
          )}

          <div className="space-y-5">
            {}
            <div>
              <label className="block text-sm font-medium text-(--text-main) mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Data Structures Chapter 1 Notes"
                className="w-full px-4 py-2 border border-(--border-main) rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-(--bg-main) text-(--text-main)"
              />
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-(--text-main) mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe what this resource covers... (Tip: add #Semester2 to auto-set the semester)"
                className="w-full px-4 py-3 border border-(--border-main) rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none min-h-24 bg-(--bg-main) text-(--text-main)"
              />
            </div>

            <TagSelectorSection
              systemTags={formData.system_tags}
              systemTagCap={SYSTEM_TAG_CAP}
              systemTagOptions={systemTagOptions}
              isLoadingTags={isLoadingTags}
              onToggleSystemTag={toggleSystemTag}
            />

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-(--text-main) mb-1">
                  Type *
                </label>
                <select
                  name="resource_type"
                  value={formData.resource_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-(--border-main) rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-(--bg-main) text-(--text-main)"
                >
                  <option value="notes">Notes</option>
                  <option value="book">Book/eBook</option>
                  <option value="project">Project Work</option>
                  <option value="link">External Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-(--text-main) mb-1">
                  Program *
                </label>
                <AcademicProgramFilter
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleChange}
                  options={programs}
                  placeholder="Select Program"
                  required
                  className="w-full px-4 py-2 border border-(--border-main) rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-(--bg-main) text-(--text-main)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-(--text-main) mb-1">
                  Semester (Optional)
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-(--border-main) rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-(--bg-main) text-(--text-main)"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-medium text-(--text-main) mb-2">
                {formData.resource_type === "link"
                  ? "Resource Link *"
                  : "Upload File *"}
              </label>

              {formData.resource_type === "link" ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-(--text-muted)" />
                  </div>
                  <input
                    type="url"
                    name="url"
                    required
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com/guide"
                    className="w-full pl-10 pr-4 py-2 border border-(--border-main) rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-(--bg-main) text-(--text-main)"
                  />
                </div>
              ) : (
                <div className="border border-(--border-main) border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-(--bg-active)/50 hover:bg-(--bg-active) transition-colors">
                  <Upload className="w-8 h-8 text-purple-600 mb-3" />
                  <p className="text-sm text-(--text-muted) mb-1">
                    Drag and drop your file here, or
                  </p>
                  <label className="text-sm font-medium text-purple-600 hover:text-purple-700 cursor-pointer">
                    <span>Browse files</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      required={!file}
                    />
                  </label>
                  {file && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-(--text-main) bg-(--bg-card) px-3 py-2 rounded-lg border border-(--border-main) shadow-sm w-full max-w-sm justify-center">
                      <FileIcon className="w-4 h-4 text-purple-600" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  )}
                  <p className="text-xs text-(--text-muted) mt-2">
                    Max size: {MAX_FILE_SIZE_LABEL} (PDF, DOC, DOCX, Images)
                  </p>
                  {file && isFileTooLarge && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      Selected file exceeds {MAX_FILE_SIZE_LABEL}. Choose a
                      smaller file to enable upload.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {}
          <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <p>
              Your resource will be reviewed by moderators before becoming
              public. Approved resources earn you{" "}
              <strong>50 VXP and 10 reputation points</strong>! Well-tagged resources are
              recommended more often.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-(--text-muted) hover:bg-(--bg-active) rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-5 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadMutation.isPending ? "Uploading…" : "Submit Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceUploadModal;
