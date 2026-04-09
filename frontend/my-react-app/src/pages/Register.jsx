import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePrograms } from "../hooks/usePrograms";
import { register, login } from "../services/auth";
import {
  Mail,
  Lock,
  User,
  School,
  MapPin,
  Hash,
  Upload,
  Target,
  Search,
  ChevronRight,
  GraduationCap,
  Calendar,
  BookOpen,
  Briefcase,
  FileText,
  CheckCircle,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { calculateSemesterFromBatch } from "../utils/academic";
import { toast } from "react-toastify";
import { Tag } from "lucide-react";
import Button from "../components/ui/Button";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const { data: programs, isLoading: programsLoading } = usePrograms();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    university: "TU",
    campus: "",
    program_id: "",
    batch_year: "",
    batch_date: "", // New field for calendar picker
    semester: "",
    semester_is_manual: false,
    tu_registration_no: "",
    career_scope: [],
  });

  const [systemTagOptions, setSystemTagOptions] = useState([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [studentIdFile, setStudentIdFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
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
    fetchTags();
  }, []);

  // Auto-calculate semester logic
  useEffect(() => {
    if (formData.semester_is_manual || !formData.batch_year) return;
    const calculatedSemester = calculateSemesterFromBatch(formData.batch_year);
    if (calculatedSemester) {
      setFormData((prev) => ({
        ...prev,
        semester: String(calculatedSemester),
      }));
    }
  }, [formData.batch_year, formData.semester_is_manual]);

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;

    // Special handling for semester limit and manual override
    if (name === "semester") {
      let numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        if (numValue < 1) numValue = 1;
        if (numValue > 12) numValue = 12;
        value = String(numValue);
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        semester_is_manual: true,
      }));
      return;
    }

    // Special handling for batch date
    if (name === "batch_date") {
      const year = value ? value.split("-")[0] : "";
      setFormData((prev) => ({
        ...prev,
        batch_date: value,
        batch_year: year,
        semester_is_manual: false, // Reset manual override when batch changes
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleCareerScope = (tagName) => {
    setFormData((prev) => {
      const already = prev.career_scope.includes(tagName);
      if (already) {
        return { ...prev, career_scope: prev.career_scope.filter((t) => t !== tagName) };
      }
      if (prev.career_scope.length >= 5) return prev;
      return { ...prev, career_scope: [...prev.career_scope, tagName] };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 1024 * 1024) {
      toast.error("File size must be less than 1MB");
      return;
    }
    setStudentIdFile(file);
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.full_name) {
      setError("Fill in all required fields.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError("Password must include uppercase, lowercase, and a number.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    setError("");
    return true;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finalPayload = new FormData();
    finalPayload.append("email", formData.email);
    finalPayload.append("password", formData.password);
    finalPayload.append("full_name", formData.full_name);
    finalPayload.append("university", formData.university);
    finalPayload.append("campus", formData.campus);
    finalPayload.append("program_id", formData.program_id);
    finalPayload.append("semester", formData.semester);
    finalPayload.append("batch_year", formData.batch_year);
    finalPayload.append("semester_is_manual", formData.semester_is_manual);
    finalPayload.append("tu_registration_no", formData.tu_registration_no);
    finalPayload.append("career_scope", formData.career_scope.join(", "));

    if (studentIdFile) {
      finalPayload.append("student_id_image", studentIdFile);
    }

    try {
      await register(finalPayload);

      toast.success("Account created! Logging you in...");

      const tokenData = await login(formData.email, formData.password);

      if (tokenData.accessToken) {
        localStorage.setItem("token", tokenData.accessToken);
        localStorage.setItem("refreshToken", tokenData.refreshToken);
      }

      toast.success("Welcome to VISION");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Registration failed. Check your data.",
      );
      toast.error(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (programsLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] p-8 sm:p-10 shadow-xl shadow-purple-500/5 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--bg-active)]">
          <div
            className="h-full bg-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight">
              {step === 1 ? "Start Your Journey" : "Academic Profile"}
            </h1>
            <p className="text-[var(--text-muted)] mt-1 font-medium italic">
              {step === 1
                ? "Join the community of TU IT students."
                : "Help us personalize your experience."}
            </p>
          </div>
          <div className="px-4 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap">
            Step {step} of 2
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-2xl text-sm font-bold border border-red-100 dark:border-red-800 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-[var(--text-main)]"
                    placeholder="e.g. Aakash Bhandari"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-[var(--text-main)]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-[var(--text-main)]"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <p className="mt-2 text-[10px] text-[var(--text-muted)] font-medium">
                  Use a mix of uppercase, lowercase, and numbers.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-[var(--text-main)]"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="shiny"
              size="lg"
              className="w-full justify-center group"
            >
              Continue to Career Profile
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <p className="text-center text-sm font-medium text-[var(--text-muted)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 font-black hover:underline"
              >Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                  University
                </label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-[var(--text-main)] appearance-none"
                  >
                    <option value="TU">Tribhuvan University (TU)</option>
                    <option value="PU">Pokhara University (PU)</option>
                    <option value="KU">Kathmandu University (KU)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                  Campus Name
                </label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    name="campus"
                    required
                    value={formData.campus}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-[var(--text-main)]"
                    placeholder="e.g. ASCOL, Birendra"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                  Program
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                  <select
                    name="program_id"
                    required
                    value={formData.program_id}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-[var(--text-main)] appearance-none"
                  >
                    <option value="">Select Program</option>
                    {programs?.map((p) => (
                      <option key={p.program_id} value={p.program_id}>
                        {p.program_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-7">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                    Batch Enrollment
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="date"
                      name="batch_date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      value={formData.batch_date}
                      onChange={handleChange}
                      onKeyDown={(e) => e.preventDefault()}
                      className="w-full pl-9 pr-3 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] outline-none transition-all font-bold text-[var(--text-main)] [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="col-span-5">
                  <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                    Semester
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="number"
                      name="semester"
                      required
                      min="1"
                      max="12"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] outline-none transition-all font-bold text-[var(--text-main)]"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                TU Registration Number
              </label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  name="tu_registration_no"
                  required
                  value={formData.tu_registration_no}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-[var(--text-main)]"
                  placeholder="5-2-37-123-2019"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                  <Tag className="w-3.5 h-3.5 text-purple-500" />
                  Interested Areas
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    formData.career_scope.length >= 5
                      ? "bg-purple-100 text-purple-700"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {formData.career_scope.length}/5 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {isLoadingTags && (
                  <p className="text-xs text-[var(--text-muted)] italic">Loading tags…</p>
                )}
                {(showAllTags ? systemTagOptions : systemTagOptions.slice(0, 7)).map((tag) => {
                  const isSelected = formData.career_scope.includes(tag.name);
                  const isDisabled =
                    !isSelected && formData.career_scope.length >= 5;
                  return (
                    <button
                      key={tag.tag_id}
                      type="button"
                      onClick={() => toggleCareerScope(tag.name)}
                      disabled={isDisabled}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : isDisabled
                          ? "bg-[var(--bg-active)] text-[var(--text-muted)] border-[var(--border-main)] opacity-40 cursor-not-allowed"
                          : "bg-[var(--bg-active)] text-[var(--text-main)] border-[var(--border-main)] hover:border-purple-400 hover:text-purple-600 cursor-pointer"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {systemTagOptions.length > 7 && (
                  <button
                    type="button"
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-transparent text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    {showAllTags ? "Show less" : `+${systemTagOptions.length - 7} more`}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-2 block">
                Student ID Proof (Max 1MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="studentIdFile"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <label
                  htmlFor="studentIdFile"
                  className={`
                    flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-3xl cursor-pointer transition-all
                    ${studentIdFile ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : "bg-[var(--bg-active)] border-[var(--border-main)] hover:border-purple-300 dark:hover:border-purple-700 hover:bg-[var(--bg-card)]/50"}
                  `}
                >
                  {studentIdFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
                      <span className="text-sm font-bold text-green-700 dark:text-green-300">
                        {studentIdFile.name}
                      </span>
                      <span className="text-[10px] text-green-600 dark:text-green-400">
                        Change file
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-[var(--text-muted)]" />
                      <span className="text-sm font-bold text-[var(--text-muted)]">
                        Upload Student ID Photo
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
                        JPG, PNG, WebP only
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1 justify-center"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="shiny"
                size="lg"
                className="flex-[2] justify-center"
                isLoading={loading}
                disabled={loading}
              >
                Complete Registration
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
