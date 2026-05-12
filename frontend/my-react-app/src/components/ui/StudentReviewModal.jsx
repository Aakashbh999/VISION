import React from "react";
import { X, Check } from "lucide-react";

const StudentReviewModal = ({ isOpen, student, onClose, onApprove, onReject }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-bg-card border border-border-main rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border-main bg-bg-active/30">
          <h2 className="text-lg font-bold text-text-main">Review Student Registration</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-bg-active rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Personal Details</h3>
              <div className="bg-bg-active/30 p-4 rounded-xl border border-border-main space-y-3">
                <div>
                  <span className="text-xs text-text-muted block">Full Name</span>
                  <span className="text-sm font-medium text-text-main">{student.full_name}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Email</span>
                  <span className="text-sm font-medium text-text-main">{student.email}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Date of Birth (B.S.)</span>
                  <span className="text-sm font-medium text-text-main">{student.date_of_birth || "Not Provided"}</span>
                </div>
              </div>

              <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Academic Details</h3>
              <div className="bg-bg-active/30 p-4 rounded-xl border border-border-main space-y-3">
                <div>
                  <span className="text-xs text-text-muted block">Campus</span>
                  <span className="text-sm font-medium text-text-main">{student.campus_name || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Program</span>
                  <span className="text-sm font-medium text-text-main">{student.program_name}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Semester</span>
                  <span className="text-sm font-medium text-text-main">Semester {student.semester}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Batch Enrollment (B.S.)</span>
                  <span className="text-sm font-medium text-text-main">{student.batch_year || "Unknown"}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Registration Number</span>
                  <code className="text-xs font-mono bg-bg-active px-2 py-1 rounded text-text-muted border border-border-main mt-1 block w-fit">
                    {student.tu_registration_no || "None"}
                  </code>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">Academic Certificate</h3>
              <div className="bg-bg-active/30 p-2 rounded-xl border border-border-main h-[400px] flex items-center justify-center overflow-hidden">
                {student.academic_certificate_url ? (
                  <img
                    src={student.academic_certificate_url}
                    alt="Academic Certificate constraint"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <span className="text-sm text-text-muted">No Certificate Uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border-main bg-bg-active/30 flex justify-end gap-3">
          <button
            onClick={() => { onClose(); onReject(student.user_id, student.full_name); }}
            className="px-4 py-2 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors border border-transparent flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Reject Registration
          </button>
          <button
            onClick={() => { onClose(); onApprove(student.user_id, student.full_name); }}
            className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-lg flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Approve User
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentReviewModal;
