import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePrograms } from "../hooks/usePrograms";
import { register, login } from "../services/auth";
import { 
  Mail, Lock, User, School, MapPin, Hash, Upload, 
  Target, Search, ChevronRight, GraduationCap, Calendar, 
  BookOpen, Briefcase, FileText, CheckCircle
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { calculateSemesterFromBatch } from "../utils/academic";
import { toast } from "react-toastify";
import TagInput from "../components/ui/TagInput";

const Register = () => {
  const navigate = useNavigate();
  const { data: programs, isLoading: programsLoading } = usePrograms();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    university: "TU",
    campus: "",
    program_id: "",
    batch_year: "",
    semester: "",
    semester_is_manual: false,
    tu_registration_no: "",
    career_scope: [], 
  });

  const [studentIdFile, setStudentIdFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-calculate semester logic
  useEffect(() => {
    if (formData.semester_is_manual || !formData.batch_year) return;
    const calculatedSemester = calculateSemesterFromBatch(formData.batch_year);
    if (calculatedSemester) {
      setFormData(prev => ({ ...prev, semester: String(calculatedSemester) }));
    }
  }, [formData.batch_year, formData.semester_is_manual]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleTagsChange = (tags) => {
    setFormData(prev => ({ ...prev, career_scope: tags }));
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
    if (!formData.email || !formData.password || !formData.full_name) {
      setError("Please fill in all required fields.");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
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
      
      // Store tokens if not handled by auth service interceptors
      if (tokenData.accessToken) {
        localStorage.setItem("token", tokenData.accessToken);
        localStorage.setItem("refreshToken", tokenData.refreshToken);
      }
      
      toast.success("Welcome to VISION 🚀");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please check your data.");
      toast.error(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (programsLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
              style={{ width: `${(step / 2) * 100}%` }}
            />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {step === 1 ? "Start Your Journey" : "Academic Profile"}
                </h1>
                <p className="text-gray-500 mt-1 font-medium italic">
                  {step === 1 ? "Join the community of TU IT students." : "Help us personalize your experience."}
                </p>
            </div>
            <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap">
                Step {step} of 2
            </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      name="full_name" 
                      required 
                      value={formData.full_name} 
                      onChange={handleChange} 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" 
                      placeholder="e.g. Aakash Bhandari" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" 
                      placeholder="you@example.com" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="password" 
                      name="password" 
                      required 
                      value={formData.password} 
                      onChange={handleChange} 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" 
                      placeholder="Min. 8 characters" 
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400 font-medium">Use a mix of uppercase, lowercase, and numbers.</p>
                </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 group shadow-lg shadow-black/10"
            >
              Continue to Career Profile 
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="text-center text-sm font-medium text-gray-500">
                Already have an account? <Link to="/login" className="text-indigo-600 font-black hover:underline">Login Instead</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">University</label>
                  <div className="relative">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select 
                      name="university" 
                      value={formData.university} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 appearance-none"
                    >
                      <option value="TU">Tribhuvan University (TU)</option>
                      <option value="PU">Pokhara University (PU)</option>
                      <option value="KU">Kathmandu University (KU)</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Campus Name</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      name="campus" 
                      required 
                      value={formData.campus} 
                      onChange={handleChange} 
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" 
                      placeholder="e.g. ASCOL, Birendra" 
                    />
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Program</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select 
                      name="program_id" 
                      required 
                      value={formData.program_id} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 appearance-none"
                    >
                      <option value="">Select Program</option>
                      {programs?.map(p => (
                        <option key={p.program_id} value={p.program_id}>{p.program_name}</option>
                      ))}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Batch</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number" 
                        name="batch_year" 
                        required 
                        value={formData.batch_year} 
                        onChange={handleChange} 
                        className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-700" 
                        placeholder="2078" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Semester</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="number" 
                        name="semester" 
                        required 
                        value={formData.semester} 
                        onChange={handleChange} 
                        className="w-full pl-9 pr-3 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white outline-none transition-all font-bold text-gray-700" 
                        placeholder="1" 
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">TU Registration Number</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  name="tu_registration_no" 
                  required 
                  value={formData.tu_registration_no} 
                  onChange={handleChange} 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium" 
                  placeholder="5-2-37-123-2019" 
                />
              </div>
            </div>

            <TagInput 
              tags={formData.career_scope} 
              onChange={handleTagsChange} 
              placeholder="Add career tags (e.g. web-dev, data-science, ai)..."
            />

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Student ID Proof (Max 1MB)</label>
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
                    ${studentIdFile ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-slate-100/50"}
                  `}
                >
                  {studentIdFile ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <span className="text-sm font-bold text-green-700">{studentIdFile.name}</span>
                      <span className="text-[10px] text-green-600">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm font-bold text-slate-500">Upload Student ID Photo</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">JPG, PNG, WebP only</span>
                    </>
                  )}
                </label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="flex-1 py-4 border-2 border-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-50 hover:border-slate-200 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                         Finalizing Registration...
                      </div>
                    ) : "Complete Registration"}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;