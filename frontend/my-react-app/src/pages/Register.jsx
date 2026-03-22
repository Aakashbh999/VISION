import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePrograms } from "../hooks/usePrograms";
import { register as apiRegister, login as apiLogin, completeRegistration as apiCompleteRegistration } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, School, Hash, Upload, ChevronRight, CheckCircle2, Search, Target, Rocket } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { calculateSemesterFromBatch } from "../utils/academic";
import { toast } from "react-toastify";

const CATEGORIES = [
  {
    id: "tech",
    name: "Tech & Engineering",
    tags: ["Full-Stack Dev", "AI & Machine Learning", "Data Analytics", "Cybersecurity", "Cloud/DevOps", "Embedded Systems", "Blockchain"]
  },
  {
    id: "business",
    name: "Business & Management",
    tags: ["Product Management", "Digital Marketing", "FinTech", "Sales & BD", "Operations", "Human Resources"]
  },
  {
    id: "creative",
    name: "Creative & Design",
    tags: ["UI/UX Design", "Content Creation", "E-commerce", "Graphic Design", "Video Editing"]
  },
  {
    id: "other",
    name: "Core Industry & Govt",
    tags: ["Healthcare Management", "Sustainability/Green-Tech", "Government/Civil Services", "Banking", "Teaching/Education"]
  }
];

const Register = () => {
  const navigate = useNavigate();
  const { user, login: authLogin } = useAuth();
  const { data: programs, isLoading: programsLoading } = usePrograms();

  const [step, setStep] = useState(1);

  // Sync step with user profile if they are already logged in (e.g. after Step 1)
  useEffect(() => {
    if (user) {
      if (user.registration_step === 1) {
        setStep(2);
      }
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        full_name: user.full_name || prev.full_name,
        current_education: user.current_education || prev.current_education,
        target_exam: user.target_exam || prev.target_exam,
        career_scope: user.career_scope ? user.career_scope.split(", ") : prev.career_scope,
        university: user.university || prev.university,
        campus: user.campus || prev.campus,
        program_id: user.program_id || prev.program_id,
        batch_year: user.batch_year || prev.batch_year,
        semester: user.semester ? String(user.semester) : prev.semester,
        tu_registration_no: user.tu_registration_no || prev.tu_registration_no,
      }));
    }
  }, [user]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    // Step 2 fields
    current_education: "",
    target_exam: "",
    career_scope: [],
    // Academic fields (optional/conditional)
    university: "TU",
    campus: "",
    program_id: "",
    batch_year: "",
    semester: "",
    semester_is_manual: false,
    tu_registration_no: "",
  });

  const [studentIdFile, setStudentIdFile] = useState(null);
  const [tagSearch, setTagSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.semester_is_manual) return;
    const calculatedSemester = calculateSemesterFromBatch(formData.batch_year);
    if (!calculatedSemester) return;

    setFormData((currentData) => ({
      ...currentData,
      semester: String(calculatedSemester)
    }));
  }, [formData.batch_year, formData.semester_is_manual]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const toggleTag = (tag) => {
    setFormData(prev => {
      const isSelected = prev.career_scope.includes(tag);
      const newTags = isSelected 
        ? prev.career_scope.filter(t => t !== tag)
        : [...prev.career_scope, tag];
      
      // Proactive prompt logic (simulated with toast for now)
      if (!isSelected && (tag === "AI & Machine Learning" || tag === "Full-Stack Dev")) {
        toast.info(`Join the ${tag} Discussion Group to stay updated on the 2026 job market!`, {
          position: "bottom-right",
          autoClose: 3000
        });
      }
      
      return { ...prev, career_scope: newTags };
    });
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Capture the lead
      await apiRegister({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });

      // 2. Immediate Login to get token for Step 2
      const tokenData = await apiLogin(formData.email, formData.password);
      authLogin(tokenData); // Sets token in localStorage/API header

      setStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const step2Data = new FormData();
    // Career/Profile Scope
    step2Data.append("current_education", formData.current_education);
    step2Data.append("target_exam", formData.target_exam);
    step2Data.append("career_scope", formData.career_scope.join(", "));
    
    // Traditional academic data (for filtered features)
    step2Data.append("university", formData.university);
    step2Data.append("campus", formData.campus);
    step2Data.append("program_id", formData.program_id);
    step2Data.append("semester", formData.semester);
    step2Data.append("batch_year", formData.batch_year);
    step2Data.append("tu_registration_no", formData.tu_registration_no);
    
    if (studentIdFile) {
        step2Data.append("student_id_image", studentIdFile);
    }

    try {
      await apiCompleteRegistration(step2Data);
      toast.success("Profile completed! Welcome aboard 🚀");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  if (programsLoading) return <div className="py-20 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Progress Bar */}
      <div className="mb-10 flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>1</div>
          <span className="font-bold hidden sm:inline">Identity</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>2</div>
          <span className="font-bold hidden sm:inline">Profile Scope</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-2xl shadow-blue-500/5 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50 pointer-events-none"></div>

        <div className="relative">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {step === 1 ? "Start Your Journey" : "Design Your Future"}
          </h1>
          <p className="text-gray-500 mb-8 font-medium">
            {step === 1 
              ? "Join 5,000+ students and professionals tracking the 2026 market." 
              : "Tell us about your goals so we can tailor your experience."}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              {error}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1 FORM */
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="text"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold placeholder:text-gray-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold placeholder:text-gray-300"
                      placeholder="you@vision2026.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Secure Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold placeholder:text-gray-300"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest pl-1">Min. 8 characters • 1 Uppercase • 1 Number</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? "Initializing..." : (
                  <>
                    Continue to Career Profile
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2 FORM */
            <form onSubmit={handleStep2Submit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Career Scope / Tags */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <label className="block text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    Career Focus Tags
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search interests..."
                      className="pl-9 pr-4 py-2 bg-gray-50 border-2 border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {CATEGORIES.map(category => (
                    <div key={category.id} className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">{category.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {category.tags
                          .filter(tag => tag.toLowerCase().includes(tagSearch.toLowerCase()))
                          .map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border-2 flex items-center gap-2 ${
                                formData.career_scope.includes(tag)
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                  : 'bg-white border-gray-100 text-gray-600 hover:border-blue-200'
                              }`}
                            >
                              {tag}
                              {formData.career_scope.includes(tag) && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-2">
                    <Rocket className="w-4 h-4 text-purple-600" />
                    Academic Context
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">To provide accurate job-market insights relative to your current status.</p>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Education Status</label>
                  <select
                    name="current_education"
                    required
                    value={formData.current_education}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-sm"
                  >
                    <option value="">Select Level</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate (Masters)</option>
                    <option value="PhD">PhD / Researcher</option>
                    <option value="Professional">Working Professional</option>
                    <option value="HighSchool">High School (Grade 12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 uppercase tracking-widest">Target Exam (Optional)</label>
                  <input
                    type="text"
                    name="target_exam"
                    value={formData.target_exam}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border-2 border-transparent rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-sm"
                    placeholder="e.g. CAT 2026, Loksewa"
                  />
                </div>

                {/* Optional University Info - collapsed for non-students or by choice */}
                <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mt-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        University Details
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <select name="university" value={formData.university} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold font-white outline-none">
                                <option value="TU">TU</option><option value="KU">KU</option><option value="PU">PU</option><option value="PWU">PWU</option>
                            </select>
                        </div>
                        <input type="text" name="campus" value={formData.campus} onChange={handleChange} placeholder="Campus Name" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" />
                        <select
                            name="program_id"
                            value={formData.program_id}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
                        >
                            <option value="">Specific Program</option>
                            {programs?.map((prog) => (
                                <option key={prog.program_id} value={prog.program_id}>{prog.program_name}</option>
                            ))}
                        </select>
                        <input type="text" name="tu_registration_no" value={formData.tu_registration_no} onChange={handleChange} placeholder="Reg. Number" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none" />
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? "Optimizing Profile..." : "Complete Registration"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
