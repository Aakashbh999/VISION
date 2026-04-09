import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  FileText,
  Image as ImageIcon,
  ImagePlus,
  Upload,
  AlertCircle,
  Trash2,
  Tag,
  X,
  Plus
} from "lucide-react";
import ButtonLoader from "../../../../components/ui/ButtonLoader";
import { SYSTEM_TAG_CAP, CUSTOM_TAG_CAP } from "../../hooks/useCreateDiscussionState";

const CreateDiscussionForm = ({
  fileInputRef,
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  selectedFile,
  previewUrl,
  specializations,
  systemTagOptions,
  isLoadingTags,
  customTagInput,
  setCustomTagInput,
  toggleSystemTag,
  addCustomTag,
  removeCustomTag,
  handleCustomTagKeyDown,
  uploading,
  createMutation,
  onFileSelect,
  onRemoveFile,
  onDragOver,
  onDrop,
  onSubmit,
}) => {
  return (
    <>
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/discussions"
          className="p-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl shadow-sm hover:bg-[var(--bg-active)] transition-all text-[var(--text-muted)] hover:text-purple-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)] uppercase tracking-tighter">
          Create a post
        </h1>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-2xl overflow-hidden shadow-sm">
        <div className="flex border-b border-[var(--border-main)]">
          <button
            onClick={() => setActiveTab("post")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black transition-all ${
              activeTab === "post"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/30"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-active)]"
            }`}
          >
            <FileText className="w-4 h-4" /> Post
          </button>
          <button
            onClick={() => setActiveTab("image")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black transition-all ${
              activeTab === "image"
                ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/30"
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-active)]"
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Image
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative group">
            <select
              value={formData.specializationId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  specializationId: event.target.value,
                })
              }
              className="w-full md:w-2/3 p-4 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-xl text-sm font-bold text-[var(--text-main)] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Choose a community...</option>
              {specializations.map((specialization) => (
                <option key={specialization.id} value={specialization.id}>
                  {specialization.name.toLowerCase().replace(/\s+/g, "")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 relative">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                Post Title
              </label>
              <span
                className={`text-[10px] font-bold ${
                  formData.title.length > 100
                    ? "text-red-500"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {formData.title.length} / 100
              </span>
            </div>
            <input
              type="text"
              placeholder="What's on your mind?"
              value={formData.title}
              maxLength={100}
              onChange={(event) =>
                setFormData({ ...formData, title: event.target.value })
              }
              className="w-full p-4 text-base sm:text-lg font-black text-[var(--text-main)] border border-[var(--border-main)] rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all placeholder:text-[var(--text-muted)]/50"
            />
          </div>

          {/* ── System Tags ─────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-main)]">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                System Tags
              </label>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  formData.system_tags.length >= SYSTEM_TAG_CAP
                    ? "bg-purple-100 text-purple-700"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {formData.system_tags.length}/{SYSTEM_TAG_CAP} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {isLoadingTags && (
                <p className="text-xs text-[var(--text-muted)] italic">Loading tags…</p>
              )}
              {systemTagOptions.map((tag) => {
                const isSelected = formData.system_tags.includes(tag.tag_id);
                const isDisabled =
                  !isSelected && formData.system_tags.length >= SYSTEM_TAG_CAP;
                return (
                  <button
                    key={tag.tag_id}
                    type="button"
                    onClick={() => toggleSystemTag(tag.tag_id)}
                    disabled={isDisabled}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : isDisabled
                        ? "bg-[var(--bg-active)] text-[var(--text-muted)] border-[var(--border-main)] opacity-40 cursor-not-allowed"
                        : "bg-transparent text-[var(--text-main)] border-[var(--border-main)] hover:border-purple-400 hover:text-purple-600 cursor-pointer"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Custom Tags ──────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text-main)]">
                Custom Tags{" "}
                <span className="text-[var(--text-muted)] text-xs font-normal">
                  (optional)
                </span>
              </label>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  formData.custom_tags.length >= CUSTOM_TAG_CAP
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {formData.custom_tags.length}/{CUSTOM_TAG_CAP} added
              </span>
            </div>

            {/* Existing custom tags */}
            {formData.custom_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.custom_tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeCustomTag(tag)}
                      className="hover:text-indigo-900 ml-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Custom tag input — hidden once cap is reached */}
            {formData.custom_tags.length < CUSTOM_TAG_CAP && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleCustomTagKeyDown}
                  placeholder="e.g. hackathon, feedback…"
                  maxLength={50}
                  className="flex-1 px-4 py-2 border border-[var(--border-main)] rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-transparent text-[var(--text-main)] text-sm"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={!customTagInput.trim()}
                  className="px-3 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            value={formData.username_verification}
            onChange={(event) =>
              setFormData({
                ...formData,
                username_verification: event.target.value,
              })
            }
            className="hidden"
            tabIndex="-1"
            autoComplete="off"
          />

          <AnimatePresence mode="wait">
            {activeTab === "post" ? (
              <motion.div
                key="post-editor"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <textarea
                  placeholder="Text (optional, supports markdown in future updates...)"
                  value={formData.content}
                  onChange={(event) =>
                    setFormData({ ...formData, content: event.target.value })
                  }
                  className="w-full p-4 bg-transparent border border-[var(--border-main)] rounded-xl min-h-[300px] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-[var(--text-main)]"
                />
              </motion.div>
            ) : (
              <motion.div
                key="image-editor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {!previewUrl ? (
                  <div
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative border-2 border-dashed border-[var(--border-main)] rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-[var(--bg-active)] rounded-2xl flex items-center justify-center text-[var(--text-muted)] group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                      <ImagePlus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-[var(--text-main)]">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] mt-1 tracking-widest">
                        Diagrams, screenshots, or code snips (max 10MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-2xl border border-[var(--border-main)] overflow-hidden bg-[var(--bg-active)] group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-auto max-h-[500px] object-contain mx-auto"
                    />
                    <button
                      onClick={onRemoveFile}
                      className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                      Image Caption
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        formData.imageCaption.length > 200
                          ? "text-red-500"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {formData.imageCaption.length} / 200
                    </span>
                  </div>
                  <textarea
                    placeholder="Add a short, descriptive caption for your image..."
                    value={formData.imageCaption}
                    maxLength={200}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        imageCaption: event.target.value,
                      })
                    }
                    className="w-full p-4 bg-transparent border border-[var(--border-main)] rounded-xl min-h-[80px] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-[var(--text-main)] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Post Description
                  </label>
                  <textarea
                    placeholder="Detailed description (optional)..."
                    value={formData.content}
                    onChange={(event) =>
                      setFormData({ ...formData, content: event.target.value })
                    }
                    className="w-full p-4 bg-transparent border border-[var(--border-main)] rounded-xl min-h-[200px] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-[var(--text-main)]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-main)]">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)]">
              <AlertCircle className="w-3.5 h-3.5" />
              Your post will be filtered for profanity
            </div>
            <button
              onClick={onSubmit}
              disabled={
                createMutation.isPending ||
                uploading ||
                formData.title.length < 5 ||
                (activeTab === "image" && !selectedFile)
              }
              className="bg-purple-600 text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-purple-600/20 flex items-center gap-2"
            >
              {createMutation.isPending || uploading ? (
                <>
                  <ButtonLoader size={16} />
                  {uploading ? "Uploading Image..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Post to VISION
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateDiscussionForm;
