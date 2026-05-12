import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrograms } from "../hooks/usePrograms";
import { useCampuses } from "../hooks/useCampuses";
import { register as registerUser, login } from "../services/auth";
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
  Eye,
  EyeOff,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { calculateSemesterFromBatch } from "../utils/academic";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import TagSelectorSection from "../components/ui/TagSelectorSection";
import {
  registerStep1Schema,
  registerStep2Schema,
  normalizeFullName,
} from "../validation/registerSchema";
import { useAuth } from "../context/AuthContext";
import { getUserLandingPath } from "../utils/authRedirect";
import { useSystemTags } from "../hooks/useSystemTags";
import { toggleCappedSelection } from "../utils/tagSelection";

const Register = () => {
  const navigate = useNavigate();
  const { login: loginWithContext } = useAuth();
  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: campusesRes, isLoading: campusesLoading } = useCampuses();
  const campuses = campusesRes?.data || [];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    university: "TU",
    campus_id: "",
    program_id: "",
    batch_year: "",
    semester: "",
    semester_is_manual: false,
    tu_registration_no: "",
    date_of_birth: "",
    career_scope: [],
  });

  const [showAllTags, setShowAllTags] = useState(false);
  const { systemTagOptions, isLoadingTags } = useSystemTags(true);
  const [studentIdFile, setStudentIdFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerField, handleSubmit: handleStep1Submit } = useForm({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    },
  });

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

    if (name === "batch_year") {
      const sanitizedValue = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        batch_year: sanitizedValue,
        semester_is_manual: false,
      }));
      return;
    }

    if (name === "date_of_birth") {
      let val = value.replace(/\D/g, "");
      if (val.length > 8) val = val.slice(0, 8);

      let formatted = val;
      if (val.length > 6) {
        formatted = `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6)}`;
      } else if (val.length > 4) {
        formatted = `${val.slice(0, 4)}-${val.slice(4)}`;
      }

      setFormData((prev) => ({
        ...prev,
        date_of_birth: formatted,
      }));
      return;
    }

    if (name === "tu_registration_no") {

      let sanitizedValue = value.replace(/[^0-9-]/g, "").replace(/-+/g, "-");
      setFormData((prev) => ({
        ...prev,
        tu_registration_no: sanitizedValue,
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
      const nextCareerScope = toggleCappedSelection(
        prev.career_scope,
        tagName,
        5,
      );
      return { ...prev, career_scope: nextCareerScope };
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

  const onStep1Valid = (step1Data) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      ...step1Data,
    }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onStep1Invalid = (validationErrors) => {
    const firstError = Object.values(validationErrors)[0];
    setError(firstError?.message || "Fill in all required fields.");
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const step2Validation = registerStep2Schema.safeParse({
      university: formData.university,
      campus_id: formData.campus_id,
      program_id: formData.program_id,
      semester: formData.semester,
      batch_year: formData.batch_year,
      tu_registration_no: formData.tu_registration_no,
      date_of_birth: formData.date_of_birth,
      career_scope: formData.career_scope,
    });

    if (!step2Validation.success) {
      setError(
        step2Validation.error.issues[0]?.message ||
          "Please complete all required fields.",
      );
      setLoading(false);
      return;
    }

    if (!studentIdFile) {
      setError("Academic Certificate is required.");
      setLoading(false);
      return;
    }

    const finalPayload = new FormData();
    const normalizedFullName = normalizeFullName(formData.full_name);
    finalPayload.append("email", formData.email);
    finalPayload.append("password", formData.password);
    finalPayload.append("full_name", normalizedFullName);
    finalPayload.append("university", formData.university);
    finalPayload.append("campus_id", formData.campus_id);
    finalPayload.append("program_id", formData.program_id);
    finalPayload.append("semester", formData.semester);
    finalPayload.append("batch_year", formData.batch_year);
    finalPayload.append("semester_is_manual", formData.semester_is_manual);
    finalPayload.append("tu_registration_no", formData.tu_registration_no);
    finalPayload.append("date_of_birth", formData.date_of_birth);
    finalPayload.append("career_scope", formData.career_scope.join(", "));

    if (studentIdFile) {
      finalPayload.append("academic_certificate", studentIdFile);
    }

    try {
      await registerUser(finalPayload);

      toast.success("Account created! Logging you in...");

      const tokenData = await login(formData.email, formData.password);
      const user = await loginWithContext(tokenData);

      toast.success("Welcome to VISION");
      navigate(getUserLandingPath(user) || "/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Check your data.",
      );
      toast.error(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (programsLoading || campusesLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-(--bg-card) rounded-sm sm:rounded-3xl border border-(--border-main) p-8 sm:p-10 shadow-xl shadow-purple-500/5 relative overflow-hidden">
        {}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-(--bg-active)">
          <div
            className="h-full bg-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-(--text-main) tracking-tight">
              {step === 1 ? "Start Your Journey" : "Academic Profile"}
            </h1>
            <p className="text-(--text-muted) mt-1 font-medium italic">
              {step === 1
                ? "Join the community of IT students."
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
          <form
            onSubmit={handleStep1Submit(onStep1Valid, onStep1Invalid)}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted) group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="text"
                    required
                    {...registerField("full_name", {
                      onChange: () => setError(""),
                    })}
                    className="w-full pl-12 pr-4 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-(--text-main)"
                    placeholder="e.g. Aakash Bhandari"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted) group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type="email"
                    required
                    {...registerField("email", {
                      onChange: () => setError(""),
                    })}
                    className="w-full pl-12 pr-4 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-(--text-main)"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted) group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    {...registerField("password", {
                      onChange: () => setError(""),
                    })}
                    className="w-full pl-12 pr-12 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-(--text-main)"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--text-muted) hover:text-purple-500 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-(--text-muted) font-medium">
                  Use a mix of uppercase, lowercase, and numbers.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted) group-focus-within:text-purple-500 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    {...registerField("confirmPassword", {
                      onChange: () => setError(""),
                    })}
                    className="w-full pl-12 pr-12 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-(--text-main)"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-(--text-muted) hover:text-purple-500 transition-colors"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
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

            <p className="text-center text-sm font-medium text-(--text-muted)">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-600 font-black hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                  University
                </label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-(--text-main) appearance-none"
                  >
                    <option value="TU">Tribhuvan University (TU)</option>
                    <option value="PU">Pokhara University (PU)</option>
                    <option value="KU">Kathmandu University (KU)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                  Campus Name
                </label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                  <select
                    name="campus_id"
                    required
                    value={formData.campus_id}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-(--text-main) appearance-none"
                  >
                    <option value="">Select Campus</option>
                    {campuses.map((c) => (
                      <option key={c.campus_id} value={c.campus_id}>
                        {c.campus_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                  Program
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                  <select
                    name="program_id"
                    required
                    value={formData.program_id}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-(--text-main) appearance-none"
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

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-8">
                  <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                    Batch Enrollment (B.S.)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted) pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      name="batch_year"
                      required
                      min="2000"
                      max="2100"
                      value={formData.batch_year}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) outline-none transition-all font-bold text-(--text-main)"
                      placeholder="e.g. 2080"
                    />
                  </div>
                </div>
                <div className="col-span-4">
                  <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                    Semester
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-muted)" />
                    <input
                      type="number"
                      inputMode="numeric"
                      name="semester"
                      required
                      min="1"
                      max="12"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) outline-none transition-all font-bold text-(--text-main)"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                Date of Birth (B.S.)
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                <input
                  type="text"
                  inputMode="numeric"
                  name="date_of_birth"
                  required
                  placeholder="YYYY-MM-DD (e.g. 2058-05-12)"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold text-(--text-main)"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                Registration Number
              </label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--text-muted)" />
                <input
                  type="text"
                  inputMode="numeric"
                  name="tu_registration_no"
                  required
                  value={formData.tu_registration_no}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-(--bg-active) border border-(--border-main) rounded-2xl focus:bg-(--bg-card) focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium text-(--text-main)"
                  placeholder="5-2-37-123-2019"
                />
              </div>
            </div>

            <div>
              <TagSelectorSection
                customTags={[]}
                systemTags={formData.career_scope}
                customTagInput=""
                setCustomTagInput={() => {}}
                customTagCap={0}
                systemTagCap={5}
                systemTagOptions={
                  showAllTags ? systemTagOptions : systemTagOptions.slice(0, 7)
                }
                isLoadingTags={isLoadingTags}
                customTagPlaceholder=""
                onAddCustomTag={() => {}}
                onRemoveCustomTag={() => {}}
                onToggleSystemTag={toggleCareerScope}
                onCustomTagKeyDown={() => {}}
                showCustomTags={false}
                label="Interests"
                showSystemLabel={false}
                getSystemTagId={(tag) => tag.name}
                getSystemTagLabel={(tag) => tag.name}
              />
              {systemTagOptions.length > 7 && (
                <div className="mt-2 px-1">
                  <button
                    type="button"
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium border border-transparent text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    {showAllTags
                      ? "Show less"
                      : `+${systemTagOptions.length - 7} more`}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-(--text-muted) tracking-widest mb-2 block">
                Academic Certificate (Required, Max 1MB)
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
                    ${studentIdFile ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : "bg-(--bg-active) border-(--border-main) hover:border-purple-300 dark:hover:border-purple-700 hover:bg-(--bg-card)/50"}
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
                      <Upload className="w-8 h-8 text-(--text-muted)" />
                      <span className="text-sm font-bold text-(--text-muted)">
                        Upload Student ID Photo
                      </span>
                      <span className="text-[10px] text-(--text-muted) uppercase tracking-widest font-black">
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
                className="flex-2 justify-center"
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
