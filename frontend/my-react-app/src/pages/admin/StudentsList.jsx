import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStudentsByStatus,
  suspendStudent,
  reactivateStudent,
} from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { AlertCircle, UserCheck, UserX } from "lucide-react";

const StudentsList = () => {
  const [status, setStatus] = useState("approved");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["students", status, page],
    queryFn: () => getStudentsByStatus(status, page),
  });

  const suspendMutation = useMutation({
    mutationFn: suspendStudent,
    onSuccess: () => queryClient.invalidateQueries(["students", status, page]),
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateStudent,
    onSuccess: () => queryClient.invalidateQueries(["students", status, page]),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load students</div>;

  const students = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>

      <div className="flex gap-2">
        {["approved", "pending_review", "rejected", "suspended"].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              status === s
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.user_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      student.student_status === "approved"
                        ? "bg-green-100 text-green-800"
                        : student.student_status === "pending_review"
                          ? "bg-yellow-100 text-yellow-800"
                          : student.student_status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {student.student_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {student.student_status === "suspended" ? (
                    <button
                      onClick={() => reactivateMutation.mutate(student.user_id)}
                      className="text-green-600 hover:text-green-900 flex items-center gap-1"
                    >
                      <UserCheck className="w-4 h-4" /> Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => suspendMutation.mutate(student.user_id)}
                      className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                    >
                      <AlertCircle className="w-4 h-4" /> Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg ${
                  page === p
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default StudentsList;
