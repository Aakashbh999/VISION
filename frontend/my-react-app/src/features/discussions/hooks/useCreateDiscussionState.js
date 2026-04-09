import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import {
  createDiscussion,
  uploadDiscussionImage,
} from "../../../services/discussion";

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
    tags: [],
    username_verification: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .get("/discussions/specializations")
      .then((response) => setSpecializations(response.data || []));
  }, []);

  const createMutation = useMutation({
    mutationFn: createDiscussion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
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
    uploading,
    createMutation,
    handleFileSelect,
    removeFile,
    handleDragOver,
    handleDrop,
    handleSubmit,
  };
};
