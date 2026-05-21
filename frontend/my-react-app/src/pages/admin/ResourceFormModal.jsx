import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Upload, Link as LinkIcon, FileText, Tag, Plus, Check, Loader2, AlertCircle } from "lucide-react";
import { academicDegreesApi, programsApi, tagsApi } from "../../services/admin";
import { showToast } from "../../utils/toast";
import Button from "../../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const ResourceFormModal = ({ isOpen, onClose, resource = null, onSubmit, isLoading }) => {
  const isEdit = !!resource;

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "notes",
    url: "",
    program_id: "",
    semester: "",
    degree_id: "",
    difficulty_level: "beginner",
    status: "approved",
  });

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [selectedSystemTags, setSelectedSystemTags] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Fetch reference data using TanStack Query
  const { data: degreesData = [] } = useQuery({
    queryKey: ["adminReferenceDegrees"],
    queryFn: academicDegreesApi.getAll,
  });

  const { data: programsData = [] } = useQuery({
    queryKey: ["adminReferencePrograms"],
    queryFn: programsApi.getAll,
  });

  const { data: tagsData = [] } = useQuery({
    queryKey: ["adminReferenceTags"],
    queryFn: tagsApi.getAll,
  });

  const degrees = degreesData?.data || degreesData || [];
  const programs = programsData?.data || programsData || [];
  const allTags = tagsData?.data || tagsData || [];

  // Populate form if in edit mode
  useEffect(() => {
    if (isEdit && resource) {
      setFormData({
        title: resource.title || "",
        description: resource.description || "",
        resource_type: resource.resource_type || "notes",
        url: resource.file_url || resource.url || "",
        program_id: resource.program_id || "",
        semester: resource.semester || "",
        degree_id: resource.degree_id || "",
        difficulty_level: resource.difficulty_level || "beginner",
        status: resource.status || "approved",
      });

      // Populate tags if they exist
      if (Array.isArray(resource.tags)) {
        const sysTags = resource.tags
          .filter(t => t.tag_type === "system")
          .map(t => t.tag_id);
        const custTags = resource.tags
          .filter(t => t.tag_type === "custom")
          .map(t => t.name);

        setSelectedSystemTags(sysTags);
        setCustomTags(custTags);
      } else {
        setSelectedSystemTags([]);
        setCustomTags([]);
      }
      setFile(null);
      setFileError("");
    } else {
      // Clear form for creation
      setFormData({
        title: "",
        description: "",
        resource_type: "notes",
        url: "",
        program_id: "",
        semester: "",
        degree_id: "",
        difficulty_level: "beginner",
        status: "approved",
      });
      setSelectedSystemTags([]);
      setCustomTags([]);
      setFile(null);
      setFileError("");
    }
  }, [isEdit, resource, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validation (Limit to 20MB)
    const limitBytes = 20 * 1024 * 1024;
    if (selectedFile.size > limitBytes) {
      setFileError("File size exceeds 20MB limit.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // Auto-fill title if empty
    if (!formData.title) {
      const prettyName = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      setFormData(prev => ({ ...prev, title: prettyName }));
    }
  };

  // Toggle System Tag Selection
  const toggleSystemTag = (tagId) => {
    setSelectedSystemTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  // Custom Tag Helpers
  const handleAddCustomTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleaned = customTagInput.trim().toLowerCase();
      if (!cleaned) return;

      // Check duplicate in custom tags
      if (customTags.includes(cleaned)) {
        showToast.info("Custom tag already added");
        setCustomTagInput("");
        return;
      }

      // Check if it matches any system tags
      const systemTagMatch = allTags.find(t => t.name.toLowerCase() === cleaned);
      if (systemTagMatch) {
        // Automatically select as system tag instead
        if (!selectedSystemTags.includes(systemTagMatch.tag_id)) {
          setSelectedSystemTags(prev => [...prev, systemTagMatch.tag_id]);
          showToast.success(`Added system tag: ${systemTagMatch.name}`);
        } else {
          showToast.info(`System tag "${systemTagMatch.name}" is already selected`);
        }
        setCustomTagInput("");
        return;
      }

      setCustomTags(prev => [...prev, cleaned]);
      setCustomTagInput("");
    }
  };

  const removeCustomTag = (tagName) => {
    setCustomTags(prev => prev.filter(name => name !== tagName));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast.error("Title is required");
      return;
    }

    if (formData.resource_type === "link" && !formData.url.trim()) {
      showToast.error("URL is required for link resources");
      return;
    }

    if (formData.resource_type !== "link" && !file && !formData.url && !isEdit) {
      showToast.error("Please upload a file or provide a source URL");
      return;
    }

    // Build FormData
    const submissionData = new FormData();
    submissionData.append("title", formData.title.trim());
    submissionData.append("description", formData.description.trim());
    submissionData.append("resource_type", formData.resource_type);
    submissionData.append("difficulty_level", formData.difficulty_level);
    submissionData.append("status", formData.status);
    
    if (formData.program_id) submissionData.append("program_id", formData.program_id);
    if (formData.semester) submissionData.append("semester", formData.semester);
    if (formData.degree_id) submissionData.append("degree_id", formData.degree_id);

    if (formData.resource_type === "link") {
      submissionData.append("url", formData.url.trim());
    } else {
      if (file) {
        submissionData.append("file", file);
      } else if (formData.url) {
        submissionData.append("url", formData.url.trim());
      }
    }

    submissionData.append("system_tags", JSON.stringify(selectedSystemTags));
    submissionData.append("custom_tags", JSON.stringify(customTags));

    onSubmit(submissionData);
  };

  // Filter system tags based on search
  const filteredSystemTags = allTags.filter(t =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative bg-bg-card border border-border-main rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-main bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="text-left">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {isEdit ? "Edit Resource Metadata" : "Create New Library Resource"}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {isEdit ? "Update configuration, classification details, or replace resource media." : "Add curriculum materials, notes, or books directly to the database."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-active text-text-muted hover:text-text-main rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[calc(85vh-8rem)] overflow-y-auto custom-scrollbar text-left">
          
          {/* Section 1: Core details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Resource Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main"
                  placeholder="e.g. Advanced Operating Systems Lecture Notes"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main resize-none"
                  placeholder="Describe the content, topics covered, or specific highlights of this resource..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Resource Type</label>
                  <select
                    name="resource_type"
                    value={formData.resource_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main font-semibold"
                  >
                    <option value="notes">Lecture Notes</option>
                    <option value="book">Reference Book</option>
                    <option value="project">Project Work</option>
                    <option value="link">External Link / Video</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Difficulty Level</label>
                  <select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main font-semibold"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* URL or File Source */}
              {formData.resource_type === "link" ? (
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">External Resource Link *</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="url"
                      name="url"
                      required
                      value={formData.url}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main"
                      placeholder="https://example.com/resource-link"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                    {isEdit ? "Replace File (Optional)" : "Upload Asset File *"}
                  </label>
                  
                  <div className="flex flex-col gap-2">
                    <div className="border-2 border-dashed border-border-main hover:border-blue-500/50 rounded-2xl p-5 flex flex-col items-center justify-center bg-bg-active/20 hover:bg-bg-active/40 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.png,.jpg,.jpeg"
                      />
                      <Upload className="w-8 h-8 text-blue-500 mb-2" />
                      <span className="text-sm font-bold text-text-main">
                        {file ? file.name : "Click to select or drag file here"}
                      </span>
                      <span className="text-xs text-text-muted mt-1">
                        PDF, DOCX, PPTX, ZIP or Images (Max 20MB)
                      </span>
                    </div>

                    {fileError && (
                      <span className="text-xs text-red-500 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> {fileError}
                      </span>
                    )}

                    {isEdit && !file && resource?.file_url && (
                      <div className="text-xs text-text-muted flex items-center gap-2 bg-bg-active/50 p-2.5 rounded-xl border border-border-main truncate">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">Current Asset: <a href={resource.file_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{resource.original_filename || "View asset"}</a></span>
                      </div>
                    )}

                    {/* Or URL input as fallback */}
                    <div className="mt-1">
                      <span className="text-[10px] font-bold text-text-muted uppercase block mb-1">Or provide static Cloud URL</span>
                      <input
                        type="text"
                        name="url"
                        value={formData.url}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-xs text-text-main"
                        placeholder="Alternative direct download link..."
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-border-main" />

          {/* Section 2: Taxonomy & Classification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Academic Degree</label>
              <select
                name="degree_id"
                value={formData.degree_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main font-semibold"
              >
                <option value="">-- No Degree Filter --</option>
                {degrees.map(deg => (
                  <option key={deg.degree_id} value={deg.degree_id}>{deg.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Program Specifics</label>
              <select
                name="program_id"
                value={formData.program_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main font-semibold"
              >
                <option value="">-- No Program Filter --</option>
                {programs.map(prog => (
                  <option key={prog.program_id} value={prog.program_id}>{prog.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1.5">Academic Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm transition-colors text-text-main font-semibold"
              >
                <option value="">-- General / Elective --</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-border-main" />

          {/* Section 3: Tag Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* System Tags Select */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-500" /> System Categorization Tags
                </label>
                <span className="text-[10px] font-bold text-text-muted bg-bg-active px-2 py-0.5 rounded">
                  {selectedSystemTags.length} selected
                </span>
              </div>

              <input
                type="text"
                placeholder="Search system tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="w-full px-3 py-2 bg-bg-active border border-border-main rounded-xl outline-none focus:border-blue-500 text-xs text-text-main"
              />

              <div className="border border-border-main bg-bg-active/10 rounded-2xl p-3 h-44 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start">
                {filteredSystemTags.map(tag => {
                  const isSelected = selectedSystemTags.includes(tag.tag_id);
                  return (
                    <button
                      type="button"
                      key={tag.tag_id}
                      onClick={() => toggleSystemTag(tag.tag_id)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400"
                          : "bg-bg-card border-border-main hover:bg-bg-active text-text-muted"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-blue-500" />}
                      {tag.name}
                    </button>
                  );
                })}
                {filteredSystemTags.length === 0 && (
                  <div className="text-xs text-text-muted w-full text-center py-8">
                    No system tags matching query.
                  </div>
                )}
              </div>
            </div>

            {/* Custom Tags Section */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-purple-500" /> Custom / User Tags
              </label>

              <input
                type="text"
                placeholder="Type custom tag name and press Enter..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="w-full px-4 py-3 bg-bg-active border border-border-main rounded-xl outline-none focus:border-purple-500 text-sm text-text-main"
              />
              <p className="text-[10px] text-text-muted">
                Custom tags are verified by the system and converted automatically. Add multiple by splitting with comma.
              </p>

              <div className="border border-border-main bg-bg-active/10 rounded-2xl p-4 h-32 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start">
                <AnimatePresence>
                  {customTags.map(name => (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={name}
                      className="text-xs font-bold bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5 transition-all"
                    >
                      #{name}
                      <button
                        type="button"
                        onClick={() => removeCustomTag(name)}
                        className="text-purple-600 dark:text-purple-400 hover:text-red-500 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                {customTags.length === 0 && (
                  <div className="text-xs text-text-muted w-full text-center py-6">
                    Type a name above and press Enter to generate tag.
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-border-main" />

          {/* Section 4: Resource Verification Status */}
          <div className="bg-bg-active/30 p-5 rounded-2xl border border-border-main flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-text-main">Library Publication Settings</h4>
              <p className="text-xs text-text-muted mt-1">
                Configure content visibility. Setting status to Approved instantly publishes the content in library pools.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-text-muted uppercase shrink-0">Verification State</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full md:w-44 px-3 py-2 bg-bg-card border border-border-main rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-text-main"
              >
                <option value="approved">Approved / Live</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-border-main">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="shiny"
              isLoading={isLoading}
              className="rounded-xl px-6"
            >
              {isEdit ? "Update Resource Details" : "Publish to Library"}
            </Button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default ResourceFormModal;
