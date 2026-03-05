import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDiscussion } from "../../hooks/useDiscussion";
import { useUpdateDiscussion } from "../../hooks/useDiscussionMutations";
import { useDiscussionTags } from "../../hooks/useDiscussionFilters";
import { ChevronLeft, X, Plus, Loader2, AlertTriangle } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import api from "../../services/api";

const EditDiscussion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDiscussion(id);
  const updateMutation = useUpdateDiscussion(id);
  const { data: availableTags } = useDiscussionTags();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    specializationId: "",
    degreeId: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  // Reference data
  const [specializations, setSpecializations] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [specsRes, degreesRes] = await Promise.all([
          api.get("/discussions/specializations"),
          api.get("/discussions/degrees"),
        ]);
        setSpecializations(specsRes.data || []);
        setDegrees(degreesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch reference data:", err);
      }
    };
    fetchReferenceData();
  }, []);

  // Populate form when data loads
  useEffect(() => {
    if (data?.discussion) {
      const disc = data.discussion;
      setFormData({
        title: disc.title || "",
        content: disc.content || "",
        specializationId: disc.specialization_id?.toString() || "",
        degreeId: disc.degree_id?.toString() || "",
        tags: disc.tags?.map((t) => t.tag_id) || [],
      });
    }
  }, [data]);

  // Check edit window
  const canEdit =
    data?.discussion?.created_at &&
    Date.now() - new Date(data.discussion.created_at).getTime() <
      24 * 60 * 60 * 1000;

  const timeRemaining = data?.discussion?.created_at
    ? Math.max(
        0,
        24 * 60 * 60 * 1000 -
          (Date.now() - new Date(data.discussion.created_at).getTime()),
      )
    : 0;

  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor(
    (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = (tagId) => {
    if (!formData.tags.includes(tagId) && formData.tags.length < 5) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagId] }));
    }
  };

  const handleRemoveTag = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagId),
    }));
  };

  const handleAddCustomTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      const customTag = tagInput.trim();
      if (!formData.tags.includes(customTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, customTag] }));
      }
      setTagInput("");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }
    if (!formData.specializationId) {
      newErrors.specializationId = "Please select a specialization";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData = {
      title: formData.title,
      content: formData.content,
      specializationId: parseInt(formData.specializationId),
      degreeId: formData.degreeId ? parseInt(formData.degreeId) : null,
      tags: formData.tags,
    };

    updateMutation.mutate(submitData, {
      onSuccess: () => navigate(`/portal/discussions/${id}`),
      onError: (err) => {
        setErrors({
          submit: err.response?.data?.error || "Failed to update discussion",
        });
      },
    });
  };

  const getTagName = (tagId) => {
    if (typeof tagId === "string") return tagId;
    const tag = availableTags?.find((t) => t.tag_id === tagId);
    return tag?.name || tagId;
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load discussion</div>;
  if (!canEdit) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Edit Window Expired
          </h2>
          <p className="text-gray-600 mb-4">
            Discussions can only be edited within 24 hours of posting.
          </p>
          <Link
            to={`/portal/discussions/${id}`}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Discussion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/portal/discussions/${id}`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Discussion</h1>
      </div>

      {/* Time remaining warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          You have{" "}
          <strong>
            {hoursRemaining}h {minutesRemaining}m
          </strong>{" "}
          remaining to edit this discussion.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.content ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        {/* Specialization & Degree */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization <span className="text-red-500">*</span>
            </label>
            <select
              name="specializationId"
              value={formData.specializationId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.specializationId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select specialization</option>
              {specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree <span className="text-gray-400">(optional)</span>
            </label>
            <select
              name="degreeId"
              value={formData.degreeId}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select degree</option>
              {degrees.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags <span className="text-gray-400">(up to 5)</span>
          </label>

          {/* Selected tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tagId, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {getTagName(tagId)}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tagId)}
                  className="p-0.5 hover:bg-blue-200 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom tag */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddCustomTag())
              }
              placeholder="Add a custom tag"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={formData.tags.length >= 5}
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              disabled={!tagInput.trim() || formData.tags.length >= 5}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Popular tags */}
          <div className="flex flex-wrap gap-2">
            {availableTags?.slice(0, 10).map((tag) => (
              <button
                key={tag.tag_id}
                type="button"
                onClick={() => handleAddTag(tag.tag_id)}
                disabled={
                  formData.tags.includes(tag.tag_id) ||
                  formData.tags.length >= 5
                }
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  formData.tags.includes(tag.tag_id)
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                } disabled:opacity-50`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            to={`/portal/discussions/${id}`}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
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

export default EditDiscussion;
