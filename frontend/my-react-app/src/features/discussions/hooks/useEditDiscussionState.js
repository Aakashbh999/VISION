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
      tags: discussion?.tags?.map((tag) => tag.tag_id) || [],
    }),
    [discussion],
  );

  const [draftFormData, setDraftFormData] = useState(null);
  const formData = draftFormData || initialFormData;
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [specializations, setSpecializations] = useState([]);
  const [degrees, setDegrees] = useState([]);

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

  const handleAddTag = (tagId) => {
    if (formData.tags.includes(tagId) || formData.tags.length >= 5) {
      return;
    }

    setDraftFormData((prev) => {
      const base = prev || initialFormData;
      return { ...base, tags: [...base.tags, tagId] };
    });
  };

  const handleRemoveTag = (tagId) => {
    setDraftFormData((prev) => {
      const base = prev || initialFormData;
      return {
        ...base,
        tags: base.tags.filter((tag) => tag !== tagId),
      };
    });
  };

  const handleAddCustomTag = () => {
    if (!tagInput.trim() || formData.tags.length >= 5) {
      return;
    }

    const customTag = tagInput.trim();
    if (!formData.tags.includes(customTag)) {
      setDraftFormData((prev) => {
        const base = prev || initialFormData;
        return { ...base, tags: [...base.tags, customTag] };
      });
    }

    setTagInput("");
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
      tags: formData.tags,
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
    tagInput,
    setTagInput,
    specializations,
    degrees,
    availableTags,
    updateMutation,
    handleChange,
    handleAddTag,
    handleRemoveTag,
    handleAddCustomTag,
    handleSubmit,
    getTagName,
  };
};
