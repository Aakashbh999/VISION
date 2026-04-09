import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDiscussion,
  useUpdateDiscussion,
  useDiscussionTags,
} from "../../../hooks/useDiscussionHooks";
import api from "../../../services/api";

export const useEditDiscussionState = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDiscussion(id);
  const updateMutation = useUpdateDiscussion(id);
  const { data: availableTags } = useDiscussionTags();

  const discussion = data?.discussion;

  const initialFormData = useMemo(
    () => ({
      title: discussion?.title || "",
      content: discussion?.content || "",
      specializationId: discussion?.specialization_id?.toString() || "",
      degreeId: discussion?.degree_id?.toString() || "",
      system_tags: discussion?.tags?.filter((t) => t.tag_type === "system").map((t) => t.tag_id) || [],
      custom_tags: discussion?.tags?.filter((t) => t.tag_type === "custom").map((t) => t.name) || [],
    }),
    [discussion],
  );

  const [draftFormData, setDraftFormData] = useState(null);
  const formData = draftFormData || initialFormData;
  const [errors, setErrors] = useState({});
  const [customTagInput, setCustomTagInput] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [systemTagOptions, setSystemTagOptions] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [specializationsResponse, degreesResponse] = await Promise.all([
          api.get("/discussions/specializations"),
          api.get("/discussions/degrees"),
        ]);

        setSpecializations(specializationsResponse.data || []);
        setDegrees(degreesResponse.data || []);
      } catch (fetchError) {
        console.error("Failed to fetch reference data:", fetchError);
      }
    };

    const fetchSystemTags = async () => {
      setIsLoadingTags(true);
      try {
        const res = await api.get("/discussions/tags", { params: { type: "system" } });
        setSystemTagOptions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setSystemTagOptions([]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchReferenceData();
    fetchSystemTags();
  }, []);

  const canEdit = discussion?.can_edit ?? true;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraftFormData((prev) => ({
      ...(prev || initialFormData),
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleSystemTag = (tagId) => {
    setDraftFormData((prev) => {
      const base = prev || initialFormData;
      const already = base.system_tags.includes(tagId);
      if (already) {
        return { ...base, system_tags: base.system_tags.filter((id) => id !== tagId) };
      }
      if (base.system_tags.length >= 5) return base; // MAX 5 SYSTEM TAGS
      return { ...base, system_tags: [...base.system_tags, tagId] };
    });
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag) return;
    setDraftFormData((prev) => {
      const base = prev || initialFormData;
      if (base.custom_tags.length >= 2) return base; // MAX 2 CUSTOM TAGS
      if (base.custom_tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())) return base;
      return { ...base, custom_tags: [...base.custom_tags, tag] };
    });
    setCustomTagInput("");
  };

  const removeCustomTag = (tag) => {
    setDraftFormData((prev) => {
      const base = prev || initialFormData;
      return { ...base, custom_tags: base.custom_tags.filter((t) => t !== tag) };
    });
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Title required";
    }

    if (!formData.content.trim()) {
      nextErrors.content = "Content required";
    }

    if (!formData.specializationId) {
      nextErrors.specializationId = "Select a specialization";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = {
      title: formData.title,
      content: formData.content,
      specializationId: Number.parseInt(formData.specializationId, 10),
      degreeId: formData.degreeId
        ? Number.parseInt(formData.degreeId, 10)
        : null,
      system_tags: formData.system_tags,
      custom_tags: formData.custom_tags,
    };

    updateMutation.mutate(submitData, {
      onSuccess: () => navigate(`/discussions/${id}`),
      onError: (mutationError) => {
        setErrors({
          submit:
            mutationError?.response?.data?.error ||
            "Failed to update discussion",
        });
      },
    });
  };

  const getTagName = (tagId) => {
    if (typeof tagId === "string") {
      return tagId;
    }

    const matchedTag = availableTags?.find((tag) => tag.tag_id === tagId);
    return matchedTag?.name || tagId;
  };

  return {
    id,
    data,
    discussion,
    isLoading,
    error,
    canEdit,
    formData,
    errors,
    customTagInput,
    setCustomTagInput,
    specializations,
    degrees,
    systemTagOptions,
    isLoadingTags,
    updateMutation,
    handleChange,
    toggleSystemTag,
    addCustomTag,
    removeCustomTag,
    handleCustomTagKeyDown,
    handleSubmit,
  };
};
