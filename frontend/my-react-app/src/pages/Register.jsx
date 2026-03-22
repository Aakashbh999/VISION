import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePrograms } from "../hooks/usePrograms";
import { register, login } from "../services/auth"; // Ensure these match your service file
import { Mail, Lock, User, School, MapPin, Hash, Upload, Target, Search, ChevronRight } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { calculateSemesterFromBatch } from "../utils/academic";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();
  const { data: programs, isLoading: programsLoading } = usePrograms();

  const [step, setStep] = useState(1);
  const [tagSearch, setTagSearch] = useState("");

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
    career_scope: [], // Added missing array for tags
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

  const handleFileChange = (e) => {
    setStudentIdFile(e.target.files[0]);
  };

  // STEP 1: Just validation and moving forward
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  // STEP 2: The Final Atomic Submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const finalPayload = new FormData();
    // Append Auth Data from Step 1
    finalPayload.append("email", formData.email);
    finalPayload.append("password", formData.password);
    finalPayload.append("full_name", formData.full_name);
    
    // Append Profile Data from Step 2
    finalPayload.append("university", formData.university);
    finalPayload.append("campus", formData.campus);
    finalPayload.append("program_id", formData.program_id);
    finalPayload.append("semester", formData.semester);
    finalPayload.append("batch_year", formData.batch_year);
    finalPayload.append("tu_registration_no", formData.tu_registration_no);
    finalPayload.append("career_scope", formData.career_scope.join(", "));

    if (studentIdFile) {
      finalPayload.append("student_id_image", studentIdFile);
    }

    try {
      // 1. Create user and profile in one go
      await register(finalPayload); 
      
      // 2. Log them in automatically
      const tokenData = await login(formData.email, formData.password);
      // Assuming your auth provider/context handles the token storage
      toast.success("Account created! Welcome to VISION 🚀");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  if (programsLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
            <span className="text-sm font-medium text-gray-500">Step {step} of 2</span>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            {/* Step 1 Fields: Email, Password, Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Aakash Bhandari" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Min. 8 characters" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              Continue to Career Profile <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {/* Step 2 Fields: University, Campus, Program, ID Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* University & Campus inputs from your original code go here */}
               {/* Program selection and Batch inputs from your original code go here */}
            </div>

            {/* TU Registration & File Upload from your original code */}
            
            <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Back</button>
                <button type="submit" disabled={loading} className="flex-[2] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                    {loading ? "Creating Account..." : "Complete Registration"}
                </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;