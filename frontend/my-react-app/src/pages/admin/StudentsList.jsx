import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudentsByStatus,
  suspendStudent,
  reactivateStudent,
  permanentlyDeleteUser,
} from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  AlertCircle,
  UserCheck,
  UserX,
  Trash2,
  ShieldAlert,
  Search
} from "lucide-react";
import { showToast } from "../../utils/toast";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";
import { useAuth } from "../../context/AuthContext";

const StudentsList = () => {
  const [status, setStatus] = useState("approved");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["students", status, page],
    queryFn: () => getStudentsByStatus(status, page),
  });

  const suspendMutation = useMutation({
    mutationFn: suspendStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", status, page] });
      showToast.success("Student suspended");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", status, page] });
      showToast.success("Student reactivated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: permanentlyDeleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", status, page] });
      showToast.success("User permanently deleted");
    },
    onError: (err) => {
      showToast.error(err.response?.data?.message || "Deletion failed");
    },
  });

  const handleDelete = (userId, name) => {
    setModalConfig({
      isOpen: true,
      title: "Permanent Deletion",
      message: `DANGER: Are you sure you want to PERMANENTLY delete the account for ${name}? This will remove all their data from the system and cannot be undone.`,
      type: "danger",
      confirmText: "Delete Account",
      onConfirm: () => {
        deleteMutation.mutate(userId);
        setModalConfig({ isOpen: false });
      },
    });
  };

  const handleSuspend = (userId, name) => {
    setModalConfig({
      isOpen: true,
      title: "Suspend Student",
      message: `Are you sure you want to suspend ${name}? They will lose access to the portal until reactivated.`,
      type: "warning",
      confirmText: "Suspend",
      onConfirm: () => {
        suspendMutation.mutate(userId);
        setModalConfig({ isOpen: false });
      },
    });
  };

  const handleReactivate = (userId, name) => {
    setModalConfig({
      isOpen: true,
      title: "Reactivate Student",
      message: `Reactivate ${name}'s account? They will regain full access to their dashboard.`,
      type: "info",
      confirmText: "Reactivate",
      onConfirm: () => {
        reactivateMutation.mutate(userId);
        setModalConfig({ isOpen: false });
      },
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500 font-medium">
        Failed to load students
      </div>
    );

  const students = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  const filteredStudents = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.tu_registration_no?.toLowerCase().includes(term) ||
      s.program_name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <h1 className="text-2xl font-bold text-text-main">Student Directory</h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <ShieldAlert className="w-4 h-4" /> Admin Access
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex overflow-x-auto pb-2 gap-2 flex-1">
          {["approved", "pending_review", "rejected", "suspended"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                status === s
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                  : "bg-bg-card border border-border-main text-text-muted hover:border-purple-500 hover:text-purple-600"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search this page..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-main rounded-xl text-sm focus:border-purple-500 outline-none transition-colors shadow-sm"
          />
        </div>
      </div>

      <div className="bg-bg-card rounded-2xl border border-border-main overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-border-main">
          <thead className="bg-bg-active/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                Student Profile
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-bg-card divide-y divide-border-main">
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-12 text-center text-text-muted font-medium"
                >
                  {searchTerm ? "No students match your search on this page." : "No students found in this category."}
                </td>
              </tr>
            ) : filteredStudents.map((student) => (
                <tr
                  key={student.user_id}
                  className="hover:bg-bg-active/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-text-main">
                        {student.full_name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {student.email}
                      </span>
                      {student.program_name && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-bg-active px-1.5 py-0.5 rounded font-medium text-text-muted uppercase border border-border-main">
                            {student.program_name}
                          </span>
                          <span className="text-[10px] text-text-muted font-medium">
                            SEM {student.semester} •{" "}
                            {student.tu_registration_no}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        student.is_suspended
                          ? "bg-amber-100 text-amber-700"
                          : student.student_status === "approved"
                            ? "bg-green-100 text-green-700"
                            : student.student_status === "pending_review"
                              ? "bg-yellow-100 text-yellow-700"
                              : student.student_status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {student.is_suspended
                        ? "Suspended"
                        : student.student_status.replace("_", " ")}
                    </span>
                    {student.user_id === user?.user_id && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Current User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {student.user_id !== user?.user_id ? (
                      <div className="flex justify-end gap-3">
                        {student.is_suspended ? (
                          <button
                            onClick={() =>
                              handleReactivate(
                                student.user_id,
                                student.full_name,
                              )
                            }
                            className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-800 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" /> Reactivate
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleSuspend(student.user_id, student.full_name)
                            }
                            className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 transition-colors"
                          >
                            <AlertCircle className="w-4 h-4" /> Suspend
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleDelete(student.user_id, student.full_name)
                          }
                          className="p-2 text-text-muted hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Permanently Delete Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-text-muted italic">
                        Self-Management Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  page === p
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                    : "bg-bg-card border border-border-main text-text-muted hover:bg-bg-active"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}

      <AdminConfirmModal
        {...modalConfig}
        onCancel={() => setModalConfig({ isOpen: false })}
        isLoading={
          suspendMutation.isPending ||
          reactivateMutation.isPending ||
          deleteMutation.isPending
        }
      />
    </div>
  );
};

export default StudentsList;
