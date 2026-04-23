import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingStudents,
  approveStudent,
  rejectStudent,
} from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Check, X, UserPlus, Clock, Inbox, ShieldCheck, ChevronRight } from "lucide-react";
import { showToast } from "../../utils/toast";
import { useState } from "react";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";
import StudentReviewModal from "../../components/ui/StudentReviewModal";

const PendingStudents = () => {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [reviewStudent, setReviewStudent] = useState(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingStudents"],
    queryFn: getPendingStudents,
  });

  const approveMutation = useMutation({
    mutationFn: approveStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingStudents"] });
      showToast.success("Student approved");
      setModalConfig({ isOpen: false });
    },
    onError: (err) => showToast.error("Failed to approve student"),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingStudents"] });
      showToast.success("Student registration rejected");
      setModalConfig({ isOpen: false });
    },
    onError: (err) => showToast.error("Failed to reject student"),
  });

  const handleApprove = (userId, name) => {
    setModalConfig({
      isOpen: true,
      title: "Approve Student",
      message: `Are you sure you want to approve ${name}? This will grant them full access to the student portal.`,
      type: "info",
      confirmText: "Approve Registration",
      onConfirm: () => {
        approveMutation.mutate(userId);
      },
    });
  };

  const handleReject = (userId, name) => {
    setModalConfig({
      isOpen: true,
      title: "Reject Registration",
      message: `Are you sure you want to reject the application from ${name}? They will be notified of the decision.`,
      type: "danger",
      confirmText: "Reject Student",
      onConfirm: () => {
        rejectMutation.mutate(userId);
      },
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-red-500 font-medium">
        Failed to load pending students
      </div>
    );

  const students = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <h1 className="text-2xl font-bold text-text-main">
          Pending Registrations
        </h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/10 px-3 py-1.5 rounded-full border border-blue-500/20">
          <Clock className="w-4 h-4" /> Review Queue
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-bg-card rounded-2xl border border-dashed border-border-main p-16 text-center">
          <Inbox className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-main">
            Zero Pending Students
          </h3>
          <p className="text-text-muted max-w-sm mx-auto">
            You've cleared the registration queue! New student applications will
            appear here for review.
          </p>
        </div>
      ) : (
        <div className="bg-bg-card rounded-2xl border border-border-main overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border-main">
            <thead className="bg-bg-active/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                  Student Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                  Academic Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-card divide-y divide-border-main">
              {students.map((student) => (
                <tr
                  key={student.user_id}
                  className="hover:bg-bg-active/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main">
                        {student.full_name}
                      </span>
                      <span className="text-xs text-text-muted">
                        {student.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-main">
                        {student.program_name}
                      </span>
                      <span className="text-xs text-text-muted">
                        Semester: {student.semester}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs font-mono bg-bg-active px-2 py-1 rounded text-text-muted border border-border-main">
                      {student.tu_registration_no}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReviewStudent(student)}
                        className="px-3 py-1.5 text-xs font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-xl transition-all border border-transparent shadow-sm flex items-center gap-1.5"
                      >
                       Review Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminConfirmModal
        {...modalConfig}
        onCancel={() => setModalConfig({ isOpen: false })}
        isLoading={approveMutation.isPending || rejectMutation.isPending}
      />
      
      <StudentReviewModal 
        isOpen={!!reviewStudent}
        student={reviewStudent}
        onClose={() => setReviewStudent(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default PendingStudents;
