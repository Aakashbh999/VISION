import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDiscussion, uploadDiscussionImage } from "../../services/discussion";
import {
  ChevronLeft,
  X,
  Plus,
  Info,
  FileText,
  Image as ImageIcon,
  ImagePlus,
  Upload,
  AlertCircle,
  Eye,
  Trash2
} from "lucide-react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ButtonLoader from "../../components/ui/ButtonLoader";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import TagInput from "../../components/ui/TagInput";

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("post"); // "post" or "image"
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageCaption: "",
    specializationId: "",
    tags: [],
    username_verification: "", // Honeypot
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api
      .get("/discussions/specializations")
      .then((res) => setSpecializations(res.data || []));
  }, []);

  const createMutation = useMutation({
    mutationFn: createDiscussion,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["discussions"]);
      toast.success("Post published successfully!");
      navigate(`/discussions/${data.discussion_id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to create post");
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return toast.error("File is too large (max 10MB)");
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect({ target: { files: [file] } });
    } else {
      toast.error("Please drop an image file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.username_verification) return;
    if (!formData.title || formData.title.length < 5) {
      return toast.warn("Title must be at least 5 characters");
    }
    if (!formData.specializationId) {
      return toast.warn("Please select a community");
    }
    if (activeTab === "image" && !selectedFile) {
      return toast.warn("Please upload an image");
    }

    setUploading(true);
    try {
      let imageUrl = null;
      let imagePublicId = null;

      if (activeTab === "image" && selectedFile) {
        const uploadRes = await uploadDiscussionImage(selectedFile);
        imageUrl = uploadRes.image_url;
        imagePublicId = uploadRes.image_public_id;
      }

      createMutation.mutate({
        ...formData,
        specializationId: parseInt(formData.specializationId),
        imageUrl,
        imagePublicId,
        imageCaption: activeTab === "image" ? formData.imageCaption : null,
      });
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/discussions"
          className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-all text-gray-500 hover:text-purple-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Create a post</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab("post")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black transition-all ${
                  activeTab === "post"
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/30"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" /> 📄 Post
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-black transition-all ${
                  activeTab === "image"
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50/30"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <ImageIcon className="w-4 h-4" /> 🖼️ Image
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Community Selector */}
              <div className="relative group">
                <select
                  value={formData.specializationId}
                  onChange={(e) => setFormData({ ...formData, specializationId: e.target.value })}
                  className="w-full md:w-2/3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Choose a community...</option>
                  {specializations.map((s) => (
                    <option key={s.id} value={s.id}>v/{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Title Field */}
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Post Title</label>
                  <span className={`text-[10px] font-bold ${formData.title.length > 100 ? "text-red-500" : "text-gray-400"}`}>
                    {formData.title.length} / 100
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  value={formData.title}
                  maxLength={100}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 text-lg font-black text-gray-900 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all placeholder:text-gray-300"
                />
              </div>

              {/* Tags Field */}
              <TagInput
                tags={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                placeholder="Add tags (e.g., javascript, career_tips)..."
              />

              {/* Honeypot */}
              <input
                type="text"
                value={formData.username_verification}
                onChange={(e) => setFormData({ ...formData, username_verification: e.target.value })}
                className="hidden"
                tabIndex="-1"
                autoComplete="off"
              />

              {/* Dynamic Content Area */}
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
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full p-4 bg-transparent border border-slate-200 rounded-xl min-h-[300px] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-gray-700"
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
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                          <ImagePlus className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-slate-700">Drag and drop or click to upload</p>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-widest">Diagrams, screenshots, or code snips (max 10MB)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-auto max-h-[500px] object-contain mx-auto"
                        />
                        <button
                          onClick={removeFile}
                          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Image Caption</label>
                        <span className={`text-[10px] font-bold ${formData.imageCaption.length > 200 ? "text-red-500" : "text-gray-400"}`}>
                          {formData.imageCaption.length} / 200
                        </span>
                      </div>
                      <textarea
                        placeholder="Add a short, descriptive caption for your image..."
                        value={formData.imageCaption}
                        maxLength={200}
                        onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                        className="w-full p-4 bg-transparent border border-slate-200 rounded-xl min-h-[80px] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-gray-700 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Post Description</label>
                      <textarea
                        placeholder="Detailed description (optional)..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full p-4 bg-transparent border border-slate-200 rounded-xl min-h-[200px] outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all resize-none text-gray-700"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Area */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Your post will be filtered for profanity
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || uploading || formData.title.length < 5 || (activeTab === "image" && !selectedFile)}
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
        </div>

        {/* Sidebar Guidelines */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-900 px-6 py-4">
              <h3 className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Posting to VISION
              </h3>
            </div>
            <div className="p-6 space-y-4 bg-slate-50/50">
              {[
                { title: "Collaborative Spirit", desc: "Be respectful to your fellow CS/IT students." },
                { title: "Check Duplicates", desc: "Look for similar questions before asking again." },
                { title: "Quality Context", desc: "Use clear titles and detailed descriptions." },
                { title: "Visual Advantage", desc: "Images make your technical questions clearer." }
              ].map((rule, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-[10px] font-black text-purple-500 w-4">{i + 1}.</span>
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-900 leading-none">{rule.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100 border-dashed">
            <div className="flex gap-3 items-center mb-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-purple-900 uppercase tracking-tight">Earn XP</p>
            </div>
            <p className="text-[10px] font-bold text-purple-600 leading-relaxed italic">
              "Quality contributions grant +5 VXP. Reach Level 5 to unlock global group creation."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple ShieldCheck icon
const ShieldCheck = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default CreateDiscussion;
