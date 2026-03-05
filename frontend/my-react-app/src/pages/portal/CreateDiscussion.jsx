import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDiscussion } from "../../services/discussion";
import { useDiscussionTags } from "../../hooks/useDiscussionFilters";
import { ChevronLeft, X, Plus, Info } from "lucide-react";
import api from "../../services/api";

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: availableTags } = useDiscussionTags();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    specializationId: "",
    tags: [],
  });
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    api
      .get("/discussions/specializations")
      .then((res) => setSpecializations(res.data || []));
  }, []);

  const createMutation = useMutation({
    mutationFn: createDiscussion,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["discussions"]);
      navigate(`/portal/discussions/${data.discussion_id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.length < 5 || !formData.specializationId) return;
    createMutation.mutate({
      ...formData,
      specializationId: parseInt(formData.specializationId),
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-lg font-bold">Create a post</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-md p-4 space-y-4">
            <select
              value={formData.specializationId}
              onChange={(e) =>
                setFormData({ ...formData, specializationId: e.target.value })
              }
              className="w-full md:w-1/2 p-2 text-sm border border-gray-200 rounded focus:outline-none"
            >
              <option value="">Choose a community (Specialization)</option>
              {specializations.map((s) => (
                <option key={s.id} value={s.id}>
                  v/{s.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Title (min. 5 chars)"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <textarea
              placeholder="Text (optional)"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full p-3 text-sm border border-gray-200 rounded min-h-[200px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || formData.title.length < 5}
                className="px-8 py-2 bg-blue-600 text-white font-bold rounded-full text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Rules (Reddit Style) */}
        <div className="hidden md:block space-y-4">
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="bg-blue-600 h-8 p-4 flex items-center">
              <span className="text-white text-xs font-bold uppercase">
                Posting to VISION
              </span>
            </div>
            <div className="p-4 space-y-3">
              {[
                "Be respectful to other students",
                "Check for similar questions first",
                "Use descriptive titles",
                "Choose the right specialization",
              ].map((rule, i) => (
                <div
                  key={i}
                  className="text-xs font-medium text-gray-700 border-b border-gray-50 pb-2 last:border-0"
                >
                  {i + 1}. {rule}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDiscussion;
