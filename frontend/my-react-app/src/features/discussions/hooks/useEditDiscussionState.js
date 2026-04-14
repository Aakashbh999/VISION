import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDiscussion,
  useUpdateDiscussion,
} from "../../../hooks/useDiscussionHooks";
import api from "../../../services/api";
import { useSystemTags } from "../../../hooks/useSystemTags";
import {
  addUniqueCappedTag,
  removeTag,
  toggleCappedSelection,
} from "../../../utils/tagSelection";
import { getApiErrorMessage } from "../../../utils/apiError";

export const useEditDiscussionState = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDiscussion(id);
  const updateMutation = useUpdateDiscussion(id);
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
  const { systemTagOptions, isLoadingTags } = useSystemTags(true);

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

    fetchReferenceData();
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
      return {
        ...base,
        system_tags: toggleCappedSelection(base.system_tags, tagId, 5),
      };
    });
  };

  const addCustomTag = () => {
    setDraftFormData((prev) => {
      const base = prev || initialFormData;
      const nextCustomTags = addUniqueCappedTag(base.custom_tags, customTagInput, 2);
      if (nextCustomTags.length === base.custom_tags.length) return base;
      return { ...base, custom_tags: nextCustomTags };
    });
    setCustomTagInput("");
  };

  const removeCustomTag = (tag) => {
    setDraftFormData((prev) => {
      const base = prev || initialFormData;
      return { ...base, custom_tags: removeTag(base.custom_tags, tag) };
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
          submit: getApiErrorMessage(mutationError, "Failed to update discussion"),
        });
      },
    });
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
