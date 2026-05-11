import { Link } from "react-router-dom";
import { ChevronLeft, Loader2, Plus, X, AlertTriangle, Tag } from "lucide-react";
import { SYSTEM_TAG_CAP, CUSTOM_TAG_CAP } from "../../hooks/useCreateDiscussionState";

const EditDiscussionForm = ({
  id,
  formData,
  errors,
  customTagInput,
  setCustomTagInput,
  specializations,
  degrees,
  systemTagOptions,
  isLoadingTags,
  updateMutation,
  onChange,
  toggleSystemTag,
  addCustomTag,
  removeCustomTag,
  handleCustomTagKeyDown,
  onSubmit,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
      <div className="flex items-center gap-4">
        <Link
          to={`/discussions/${id}`}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-purple-600"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
          Edit Discussion
        </h1>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Edit updates are available for a limited window after posting.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[var(--bg-main)] text-[var(--text-main)] ${
              errors.title ? "border-red-500" : "border-[var(--border-main)]"
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={onChange}
            rows={6}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-[var(--bg-main)] text-[var(--text-main)] ${
              errors.content ? "border-red-500" : "border-[var(--border-main)]"
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
              Specialization <span className="text-red-500">*</span>
            </label>
            <select
              name="specializationId"
              value={formData.specializationId}
              onChange={onChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[var(--bg-main)] text-[var(--text-main)] ${
                errors.specializationId
                  ? "border-red-500"
                  : "border-[var(--border-main)]"
              }`}
            >
              <option value="">Select specialization</option>
              {specializations.map((specialization) => (
                <option key={specialization.id} value={specialization.id}>
                  {specialization.name}
                </option>
              ))}
            </select>
            {errors.specializationId && (
              <p className="mt-1 text-sm text-red-500">
                {errors.specializationId}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
              Degree{" "}
              <span className="text-[var(--text-muted)]">(optional)</span>
            </label>
            <select
              name="degreeId"
              value={formData.degreeId}
              onChange={onChange}
              className="w-full px-4 py-2.5 border border-[var(--border-main)] rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-[var(--bg-main)] text-[var(--text-main)]"
            >
              <option value="">Select degree</option>
              {degrees.map((degree) => (
                <option key={degree.id} value={degree.id}>
                  {degree.code} - {degree.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {}
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

        {}
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

          {}
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

          {}
          {formData.custom_tags.length < CUSTOM_TAG_CAP && (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleCustomTagKeyDown}
                placeholder="e.g. hackathon, feedback…"
                maxLength={50}
                className="flex-1 px-4 py-2 border border-[var(--border-main)] rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-[var(--bg-main)] text-[var(--text-main)] text-sm"
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

        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            to={`/discussions/${id}`}
            className="px-6 py-2.5 border border-[var(--border-main)] text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-active)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDiscussionForm;
