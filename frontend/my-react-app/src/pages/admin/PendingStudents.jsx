import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingStudents,
  approveStudent,
  rejectStudent,
} from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Check, X, UserPlus, Clock, Inbox, ShieldCheck, ChevronRight, Search } from "lucide-react";
import { showToast } from "../../utils/toast";
import { useState } from "react";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";
import StudentReviewModal from "../../components/ui/StudentReviewModal";
import AdminTable from "../../components/admin_ui/AdminTable";

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
    mutationFn: ({ userId, reason }) => rejectStudent(userId, reason),
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
      message: `Are you sure you want to reject the application from ${name}? Provide a reason so they know how to fix their application.`,
      type: "danger",
      confirmText: "Reject Student",
      showInput: true,
      placeholder: "e.g., Uploaded certificate is blurred or invalid.",
      onConfirm: (reason) => {
        rejectMutation.mutate({ userId, reason });
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

  const columns = [
    {
      header: "Student Info",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-text-main">{row.full_name}</span>
          <span className="text-xs text-text-muted">{row.email}</span>
        </div>
      )
    },
    {
      header: "Academic Details",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-main">{row.program_name}</span>
          <span className="text-xs text-text-muted">Semester: {row.semester}</span>
        </div>
      )
    },
    {
      header: "Registration",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <code className="text-xs font-mono bg-bg-active px-2 py-1 rounded text-text-muted border border-border-main w-fit">
            {row.tu_registration_no}
          </code>
          {row.is_whitelisted && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20 w-fit">
              <ShieldCheck className="w-3 h-3" /> Whitelist Match
            </span>
          )}
        </div>
      )
    },
    {
      header: "Details",
      render: (row) => (
        <button
          onClick={() => setReviewStudent(row)}
          className="px-3 py-1.5 text-xs font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-xl transition-all border border-transparent shadow-sm flex items-center gap-1.5"
        >
          Review <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

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
        <AdminTable
          columns={columns}
          data={students}
          isLoading={isLoading}
          searchPlaceholder="Search pending applications..."
        />
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
