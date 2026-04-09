import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import {
  createDiscussion,
  uploadDiscussionImage,
} from "../../../services/discussion";

export const SYSTEM_TAG_CAP = 5;
export const CUSTOM_TAG_CAP = 2;

export const useCreateDiscussionState = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("post");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageCaption: "",
    specializationId: "",
    system_tags: [], // Array of system tag IDs (max 5)
    custom_tags: [], // Array of custom tag strings (max 2)
    username_verification: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [systemTagOptions, setSystemTagOptions] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [customTagInput, setCustomTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch specializations
    api
      .get("/discussions/specializations")
      .then((response) => setSpecializations(response.data || []));

    // Fetch system tags
    setIsLoadingTags(true);
    api.get("/discussions/tags", { params: { type: "system" } })
      .then((res) => {
        setSystemTagOptions(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setSystemTagOptions([]))
      .finally(() => setIsLoadingTags(false));
  }, []);

  const createMutation = useMutation({
    mutationFn: createDiscussion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      toast.success("Post published!");
      navigate(`/discussions/${data.discussion_id}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || "Failed to create post");
    },
  });

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large (max 10MB)");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect({ target: { files: [file] } });
      return;
    }

    toast.error("Drop an image file");
  };

  // Toggle a system tag on/off (respects cap)
  const toggleSystemTag = (tagId) => {
    setFormData((prev) => {
      const already = prev.system_tags.includes(tagId);
      if (already) {
        return { ...prev, system_tags: prev.system_tags.filter((id) => id !== tagId) };
      }
      if (prev.system_tags.length >= SYSTEM_TAG_CAP) return prev;
      return { ...prev, system_tags: [...prev.system_tags, tagId] };
    });
  };

  const addCustomTag = () => {
    const tag = customTagInput.trim();
    if (!tag) return;
    if (formData.custom_tags.length >= CUSTOM_TAG_CAP) return;
    if (formData.custom_tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())) return;
    setFormData((prev) => ({ ...prev, custom_tags: [...prev.custom_tags, tag] }));
    setCustomTagInput("");
  };

  const removeCustomTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      custom_tags: prev.custom_tags.filter((t) => t !== tag),
    }));
  };

  const handleCustomTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.username_verification) {
      return;
    }

    if (!formData.title || formData.title.length < 5) {
      toast.warn("Title must be at least 5 characters");
      return;
    }

    if (!formData.specializationId) {
      toast.warn("Select a community");
      return;
    }

    if (activeTab === "image" && !selectedFile) {
      toast.warn("Upload an image");
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;
      let imagePublicId = null;

      if (activeTab === "image" && selectedFile) {
        const uploadResponse = await uploadDiscussionImage(selectedFile);
        imageUrl = uploadResponse.image_url;
        imagePublicId = uploadResponse.image_public_id;
      }

      createMutation.mutate({
        ...formData,
        specializationId: Number.parseInt(formData.specializationId, 10),
        imageUrl,
        imagePublicId,
        imageCaption: activeTab === "image" ? formData.imageCaption : null,
      });
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return {
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
    handleFileSelect,
    removeFile,
    handleDragOver,
    handleDrop,
    handleSubmit,
  };
};
