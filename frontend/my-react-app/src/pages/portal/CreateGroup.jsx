import React, { useState } from "react";
import { useCreateGroup } from "../../hooks/useGroupHooks";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Terminal,
  Globe,
  Cpu,
  Database,
  Layers,
  Shield,
  Zap,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import TagInput from "../../components/ui/TagInput";

const MAX_GROUP_DESCRIPTION_WORDS = 130;

const countWords = (text = "") =>
  text.trim().split(/\s+/).filter(Boolean).length;

const ICONS = [
  { id: "terminal", icon: Terminal, label: "System/Backend", color: "text-emerald-500" },
  { id: "globe", icon: Globe, label: "Web/Frontend", color: "text-blue-500" },
  { id: "cpu", icon: Cpu, label: "Hardware/Architecture", color: "text-amber-500" },
  { id: "database", icon: Database, label: "Data Science", color: "text-rose-500" },
  { id: "layers", icon: Layers, label: "Design/UI", color: "text-purple-500" },
  { id: "shield", icon: Shield, label: "Security/DevOps", color: "text-indigo-500" },
];

const PRIVACY_TYPES = [
  { id: "public", label: "Public Directory", desc: "Anyone can join immediately. Visible to all users." },
  { id: "request", label: "Request to Join", desc: "Users must send a request. Visible in directory." },
  { id: "private", label: "Private/Hidden", desc: "Invite-only. Hidden from the public directory." },
];

const CreateGroup = () => {
  const navigate = useNavigate();
  const mutation = useCreateGroup();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "terminal",
    privacy_type: "public",
    tags: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (countWords(formData.description) > MAX_GROUP_DESCRIPTION_WORDS) {
      toast.error(`Description cannot exceed ${MAX_GROUP_DESCRIPTION_WORDS} words.`);
      return;
    }

    mutation.mutate(
      {
        name: formData.name,
        description: formData.description,
        privacy_type: formData.privacy_type,
        tags: formData.tags,
      },
      {
        onSuccess: (data) => {
          toast.success("Node Initialized!");
          navigate(`/groups/${data.group_id || data.id}`);
        },
      },
    );
  };

  const nextStep = () => {
    if (countWords(formData.description) > MAX_GROUP_DESCRIPTION_WORDS) {
      toast.error(`Description cannot exceed ${MAX_GROUP_DESCRIPTION_WORDS} words.`);
      return;
    }
    setStep(2);
  };
  const prevStep = () => setStep(1);

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <Link
        to="/groups"
        className="inline-flex items-center gap-2 text-sm font-black text-[var(--text-muted)] hover:text-purple-600 uppercase tracking-widest transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Return to Labyrinth
      </Link>

      <div className="relative bg-[var(--bg-card)]/70 backdrop-blur-2xl rounded-[2.5rem] border border-[var(--border-main)]/60 p-6 sm:p-10 shadow-2xl shadow-purple-500/5 overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--bg-active)] flex">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
          />
        </div>

        <div className="space-y-8">
          <header className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em]">
                Step 0{step} of 02
              </span>
              <AnimatePresence mode="wait">
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100"
                  >
                    <Check className="w-3 h-3" /> Basic Info Logged
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight leading-none">
              {step === 1 ? "Initialize Node" : "Select Identity"}
            </h1>
            <p className="text-[var(--text-muted)] font-medium">
              {step === 1
                ? "Define the purpose and designation of your learning circle."
                : "Choose an interface icon that represents your group's focus."}
            </p>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    Designation (Name)
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                    placeholder="e.g., QUANTUM_ALGORITHMS_2026"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    Operational Scope (Description)
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none resize-none transition-all font-medium text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                    placeholder="What is the mission of this node?"
                  />
                  <p
                    className={`text-xs text-right ${countWords(formData.description) > MAX_GROUP_DESCRIPTION_WORDS ? "text-red-600" : "text-[var(--text-muted)]"}`}
                  >
                    {countWords(formData.description)}/{MAX_GROUP_DESCRIPTION_WORDS} words
                  </p>
                </div>

                {/* Tags Field */}
                <TagInput
                  tags={formData.tags}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  placeholder="Add group tags (e.g., algorithms, machine_learning)..."
                />

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.name.trim()}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  Configure Identity
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-3 gap-4">
                  {ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isActive = formData.icon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.id })}
                        className={`group p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                          isActive
                            ? "bg-purple-50 border-purple-500 shadow-lg shadow-purple-500/10"
                            : "bg-[var(--bg-active)] border-[var(--border-main)] hover:border-[var(--border-main)]"
                        }`}
                      >
                        <IconComp
                          className={`w-8 h-8 ${isActive ? item.color : "text-[var(--text-muted)] group-hover:text-[var(--text-main)]"}`}
                        />
                        <span
                          className={`text-[9px] font-black uppercase tracking-tighter text-center ${isActive ? "text-purple-700" : "text-[var(--text-muted)]"}`}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4 pt-4 border-t border-[var(--border-main)]">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                    Security Policy
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {PRIVACY_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          handleChange({ target: { name: "privacy_type", value: type.id } })
                        }
                        className={`flex items-start text-left gap-4 p-4 rounded-2xl border-2 transition-all ${
                          formData.privacy_type === type.id
                            ? "bg-purple-50 border-purple-500 shadow-sm"
                            : "bg-[var(--bg-card)] border-[var(--border-main)] hover:border-[var(--border-main)]"
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1 rounded-full ${formData.privacy_type === type.id ? "bg-purple-500" : "bg-[var(--text-muted)]"}`}
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold ${formData.privacy_type === type.id ? "text-purple-900" : "text-[var(--text-main)]"}`}
                          >
                            {type.label}
                          </span>
                          <span className="text-xs font-medium text-[var(--text-muted)]">{type.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-4 bg-[var(--bg-active)] text-[var(--text-main)] font-black rounded-2xl hover:bg-[var(--border-main)] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={mutation.isLoading}
                    className="flex-[2] relative overflow-hidden group py-4 bg-purple-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="flex items-center justify-center gap-2">
                      <Rocket className="w-5 h-5" />
                      {mutation.isLoading ? "COMMENCING..." : "ACTIVATE NODE"}
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="text-center px-6">
        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" /> VisionXP Protocol v4.0.1 — Secure Creation Mode
        </p>
      </footer>
    </div>
  );
};

export default CreateGroup;