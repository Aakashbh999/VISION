import React, { useState } from "react";
import { X, Upload, File as FileIcon, Link as LinkIcon } from "lucide-react";
import { useUploadResource } from "../../hooks/useUploadResource";
import { usePrograms } from "../../hooks/usePrograms";
import TagInput from "../ui/TagInput";

const ResourceUploadModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "notes",
    program_id: "",
    semester: "",
    url: "",
    tags: [],
  });
  const [file, setFile] = useState(null);

  const { data: programsData } = usePrograms();

  const programs = programsData?.data || programsData || [];
  const uploadMutation = useUploadResource();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("resource_type", formData.resource_type);

    if (formData.program_id)
      submitData.append("program_id", parseInt(formData.program_id));
    if (formData.semester) submitData.append("semester", formData.semester);

    // Send explicit tags as JSON string
    if (formData.tags.length > 0) {
      submitData.append("tags", JSON.stringify(formData.tags));
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
        setFormData({
          title: "",
          description: "",
          resource_type: "notes",
          program_id: "",
          semester: "",
          url: "",
          tags: [],
        });
        setFile(null);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-gray-800">Share a Resource</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Data Structures Chapter 1 Notes"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe what this resource covers..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none min-h-[100px]"
              />
            </div>

            {/* Tags Field */}
            <TagInput
              tags={formData.tags}
              onChange={(tags) => setFormData((prev) => ({ ...prev, tags }))}
              placeholder="Add resource tags (e.g., algorithms, semester3)..."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="resource_type"
                  value={formData.resource_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="notes">Notes</option>
                  <option value="book">Book/eBook</option>
                  <option value="project">Project Work</option>
                  <option value="link">External Link</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program (Optional)
                </label>
                <select
                  name="program_id"
                  value={formData.program_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="">All Programs</option>
                  {Array.isArray(programs) &&
                    programs.map((p) => (
                      <option key={p.program_id || p.id} value={p.program_id || p.id}>
                        {p.program_name || p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester (Optional)
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File or URL Input */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.resource_type === "link" ? "Resource Link *" : "Upload File *"}
              </label>

              {formData.resource_type === "link" ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    name="url"
                    required
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com/guide"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <Upload className="w-8 h-8 text-blue-500 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag and drop your file here, or
                  </p>
                  <label className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                    <span>Browse files</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      required={!file}
                    />
                  </label>
                  {file && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full max-w-sm justify-center">
                      <FileIcon className="w-4 h-4 text-blue-500" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Max size: 10MB (PDF, DOC, DOCX, Images, ZIP)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <p>
              Your resource will be reviewed by moderators before becoming
              public. Approved resources earn you{" "}
              <strong>10 reputation points</strong>!
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                uploadMutation.isPending ||
                (!file && formData.resource_type !== "link")
              }
              className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadMutation.isPending ? "Uploading..." : "Submit Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceUploadModal;
