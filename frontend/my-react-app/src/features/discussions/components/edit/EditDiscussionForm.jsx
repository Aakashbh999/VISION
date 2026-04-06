import { Link } from "react-router-dom";
import { ChevronLeft, Loader2, Plus, X, AlertTriangle } from "lucide-react";

const EditDiscussionForm = ({
  id,
  formData,
  errors,
  tagInput,
  setTagInput,
  specializations,
  degrees,
  availableTags,
  updateMutation,
  onChange,
  onAddTag,
  onRemoveTag,
  onAddCustomTag,
  onSubmit,
  getTagName,
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 px-0 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
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

        <div>
          <label className="block text-sm font-medium text-[var(--text-main)] mb-1">
            Tags <span className="text-[var(--text-muted)]">(up to 5)</span>
          </label>

          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tagId, index) => (
              <span
                key={`${tagId}-${index}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {getTagName(tagId)}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tagId)}
                  className="p-0.5 hover:bg-purple-200 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(event) => setTagInput(event.target.value)}
              onKeyPress={(event) =>
                event.key === "Enter" &&
                (event.preventDefault(), onAddCustomTag())
              }
              placeholder="Add a custom tag"
              className="flex-1 px-3 py-2 border border-[var(--border-main)] rounded-lg text-sm bg-[var(--bg-main)] text-[var(--text-main)]"
              disabled={formData.tags.length >= 5}
            />
            <button
              type="button"
              onClick={onAddCustomTag}
              disabled={!tagInput.trim() || formData.tags.length >= 5}
              className="px-3 py-2 bg-[var(--bg-active)] text-[var(--text-muted)] rounded-lg hover:bg-[var(--border-main)] disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableTags?.slice(0, 10).map((tag) => (
              <button
                key={tag.tag_id}
                type="button"
                onClick={() => onAddTag(tag.tag_id)}
                disabled={
                  formData.tags.includes(tag.tag_id) ||
                  formData.tags.length >= 5
                }
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  formData.tags.includes(tag.tag_id)
                    ? "bg-purple-100 text-purple-700 border-purple-200"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-main)] hover:border-purple-400"
                } disabled:opacity-50`}
              >
                {tag.name}
              </button>
            ))}
          </div>
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
