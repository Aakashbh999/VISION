import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { usePrograms } from "../hooks/usePrograms";
import { register } from "../services/auth";
import { Mail, Lock, User, School, MapPin, Hash, Upload } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { calculateSemesterFromBatch } from "../utils/academic";

const Register = () => {
  const navigate = useNavigate();
  const { data: programs, isLoading: programsLoading } = usePrograms();

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
    // student_id_image is handled separately (file upload)
  });

  const [studentIdFile, setStudentIdFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.semester_is_manual) return;

    const calculatedSemester = calculateSemesterFromBatch(formData.batch_year);
    if (!calculatedSemester) return;

    setFormData((currentData) => {
      const nextSemester = String(calculatedSemester);
      if (currentData.semester === nextSemester) return currentData;
      return { ...currentData, semester: nextSemester };
    });
  }, [formData.batch_year, formData.semester_is_manual]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((currentData) => ({
        ...currentData,
        [name]: checked,
        semester:
          name === "semester_is_manual" && !checked && currentData.batch_year
            ? String(
                calculateSemesterFromBatch(currentData.batch_year) ||
                  currentData.semester,
              )
            : currentData.semester,
      }));
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setStudentIdFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Create FormData to handle file upload
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (studentIdFile) {
      data.append("student_id_image", studentIdFile);
    }

    try {
      const response = await register(data); // assuming your API accepts multipart/form-data
      setSuccess(
        response.message ||
          "Registration successful! Please check your email to verify your account.",
      );
      // Optionally redirect to login after a few seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (programsLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create Your Account
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          encType="multipart/form-data"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="•••••••• (min. 8 characters)"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* University & Campus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                University *
              </label>
              <select
                name="university"
                required
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="TU">Tribhuvan University (TU)</option>
                <option value="KU">Kathmandu University (KU)</option>
                <option value="PU">Pokhara University (PU)</option>
                <option value="PWU">Purbanchal University (PU)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus *
              </label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="campus"
                  required
                  value={formData.campus}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Patan Multiple Campus"
                />
              </div>
            </div>
          </div>

          {/* Program, Batch & Semester */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program *
              </label>
              <select
                name="program_id"
                required
                value={formData.program_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select Program</option>
                {programs?.map((prog) => (
                  <option key={prog.program_id} value={prog.program_id}>
                    {prog.program_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Year
              </label>
              <input
                type="text"
                name="batch_year"
                value={formData.batch_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    batch_year: e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 4),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="2079"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1 gap-4">
                <label className="block text-sm font-medium text-gray-700">
                  Current Semester *
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    name="semester_is_manual"
                    checked={formData.semester_is_manual}
                    onChange={handleChange}
                  />
                  Override manually
                </label>
              </div>

              <select
                name="semester"
                required
                value={formData.semester}
                onChange={handleChange}
                disabled={!formData.semester_is_manual && !!formData.batch_year}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 mt-1">
                {formData.batch_year && !formData.semester_is_manual
                  ? `Auto-filled from batch ${formData.batch_year}.`
                  : "You can still select this manually if your session is delayed."}
              </p>
            </div>
          </div>

          {/* TU Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TU Registration Number *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="tu_registration_no"
                required
                value={formData.tu_registration_no}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="TU-2025-12345"
              />
            </div>
          </div>

          {/* Student ID Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID Card (Photo) *
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Max 700KB, JPG or PNG</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-linear-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
