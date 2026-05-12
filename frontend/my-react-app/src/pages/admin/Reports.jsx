import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useDebounce from "../../hooks/useDebounce";
import {
  getReports,
  resolveReportAction,
  examineReport,
} from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  CheckCircle,
  AlertOctagon,
  Trash2,
  XCircle,
  Eye,
  Calendar,
  User,
  ExternalLink,
  MessageSquare,
  FileText,
  Search,
  Loader2,
} from "lucide-react";
import { showToast } from "../../utils/toast";
import AdminConfirmModal from "../../components/ui/AdminConfirmModal";
import { motion, AnimatePresence } from "framer-motion";

const ExaminationModal = ({ isOpen, onClose, reportId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["examineReport", reportId],
    queryFn: () => examineReport(reportId),
    enabled: !!reportId && isOpen,
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-bg-card border border-border-main w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-border-main flex justify-between items-center bg-bg-active/20">
            <h2 className="text-xl font-black text-text-main flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Content Examination
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-active rounded-xl transition-colors"
            >
              <XCircle className="w-6 h-6 text-text-muted" />
            </button>
          </div>

          <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="py-12 flex flex-center flex-col gap-4 text-center">
                <LoadingSpinner />
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest">
                  Fetching targeted content...
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-bg-active/40 rounded-2xl border border-border-main/50">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-1">
                      Target Type
                    </p>
                    <div className="flex items-center gap-2 text-text-main font-bold capitalize">
                      {data?.report?.target_type === "discussion" && (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      {data?.report?.target_type === "resource" && (
                        <FileText className="w-4 h-4" />
                      )}
                      {data?.report?.target_type}
                    </div>
                  </div>
                  <div className="p-4 bg-bg-active/40 rounded-2xl border border-border-main/50">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-1">
                      Target ID
                    </p>
                    <p className="text-text-main font-mono text-sm font-bold">
                      #{data?.report?.target_id}
                    </p>
                  </div>
                </div>

                {}
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase mb-2 tracking-widest">
                      Reported Content Preview
                    </p>
                    <div className="p-6 bg-bg-main border border-border-main rounded-2xl space-y-4">
                      {data?.content?.discussion_title && (
                        <h3 className="text-lg font-black text-text-main leading-tight border-b border-border-main pb-3 mb-3">
                          {data.content.discussion_title}
                        </h3>
                      )}

                      {data?.content?.title &&
                        data.report.target_type !== "comment" && (
                          <h3 className="text-lg font-black text-text-main leading-tight border-b border-border-main pb-3 mb-3">
                            {data.content.title}
                          </h3>
                        )}

                      <div className="text-text-main font-medium leading-relaxed whitespace-pre-wrap text-sm italic border-l-2 border-purple-500/30 pl-4 py-1">
                        {data?.content?.content ||
                          data?.content?.message ||
                          "Content not found or already removed."}
                      </div>

                      {data?.content?.image_url && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-border-main max-h-64">
                          <img
                            src={data.content.image_url}
                            alt="Target Content"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {}
                  <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                    <p className="text-[10px] font-black text-rose-600 uppercase mb-2">
                      Original Violation Report
                    </p>
                    <p className="text-sm font-bold text-text-main italic">
                      "{data?.report?.reason}"
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-text-muted uppercase">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(data?.report?.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-bg-active/40 border-t border-border-main flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-black text-text-muted hover:text-text-main uppercase tracking-widest transition-colors"
            >
              Close Manual Review
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [modalConfig, setModalConfig] = useState({ isOpen: false });
  const [examineId, setExamineId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = { page: page.toString() };
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    setSearchParams(params, { replace: true });
  }, [page, debouncedSearchTerm, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["reports", page, debouncedSearchTerm],
    queryFn: () => getReports(page, 10, debouncedSearchTerm),
    keepPreviousData: true,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ reportId, action }) => resolveReportAction(reportId, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      showToast.success(`Report ${variables.action.replace("_", " ")}`);
    },
    onError: (err) => {
      showToast.error(err.response?.data?.message || "Action failed");
    },
  });

  if (error)
    return <div className="p-8 text-red-500">Failed to load reports</div>;

  const reports = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  const handleAction = (reportId, action) => {
    let title = "";
    let message = "";
    let type = "info";
    let confirmText = "Confirm";

    if (action === "dismiss") {
      title = "Dismiss Report";
      message =
        "Are you sure you want to dismiss this report? The content will remain visible as it is.";
      type = "info";
      confirmText = "Dismiss";
    } else if (action === "soft_delete") {
      title = "Soft Delete Content";
      message =
        "This will hide the content from all users. You can still restore it later from the logs.";
      type = "warning";
      confirmText = "Hide Content";
    } else if (action === "hard_delete") {
      title = "PERMANENT DELETE";
      message =
        "DANGER: This will permanently purge the content and all related data from the database. This action CANNOT be undone.";
      type = "danger";
      confirmText = "Delete Permanently";
    }

    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm: () => {
        resolveMutation.mutate({ reportId, action });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold text-text-main">Moderation Queue</h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50/10 px-3 py-1.5 rounded-full border border-rose-500/20 w-fit mt-1">
            <AlertOctagon className="w-4 h-4" /> Priority Review
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search across all pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-main rounded-xl text-sm focus:border-rose-500 outline-none transition-colors shadow-sm"
          />
          {(isLoading || isFetching) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-bg-card rounded-2xl border border-dashed border-border-main p-16 text-center">
          <CheckCircle className="w-12 h-12 text-green-500/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-main">
            No Pending Reports
          </h3>
          <p className="text-text-muted max-w-sm mx-auto">
            All reports processed. Great job keeping the community safe!
          </p>
        </div>
      ) : (
        <div className="bg-bg-card rounded-2xl border border-border-main overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border-main overflow-x-auto text-left">
            <thead className="bg-bg-active/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">
                  Reason for Report
                </th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-bg-card divide-y divide-border-main">
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-text-muted italic">
                    {searchTerm ? "No reports found matching your search." : "No reports found."}
                  </td>
                </tr>
              ) : reports.map((report) => (
                <tr
                  key={report.report_id}
                  className="hover:bg-bg-active/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setExamineId(report.report_id)}
                      className="flex flex-col text-left hover:scale-105 transition-transform group"
                    >
                      <span className="text-[10px] font-black uppercase text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full w-fit mb-1 border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-600 transition-colors">
                        {report.target_type}
                      </span>
                      <span className="text-sm font-mono text-text-muted flex items-center gap-1">
                        ID: {report.target_id}{" "}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-main">
                    <p className="text-sm line-clamp-2 max-w-xs italic font-bold">
                      "{report.reason}"
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                        <User className="w-3 h-3" /> By User{" "}
                        {report.reporter_user_id}
                      </span>
                      <span className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setExamineId(report.report_id)}
                        className="p-2.5 text-purple-600 hover:bg-purple-500/10 rounded-xl transition-all border border-transparent hover:border-purple-500/20"
                        title="Examine Content"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <div className="w-px h-8 bg-border-main mx-1" />
                      <button
                        onClick={() =>
                          handleAction(report.report_id, "dismiss")
                        }
                        className="p-2.5 text-text-muted hover:text-green-600 hover:bg-green-500/10 rounded-xl transition-all"
                        title="Dismiss"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleAction(report.report_id, "soft_delete")
                        }
                        className="p-2.5 text-amber-500 hover:text-amber-700 hover:bg-amber-500/10 rounded-xl transition-all"
                        title="Hide Content"
                      >
                        <AlertOctagon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleAction(report.report_id, "hard_delete")
                        }
                        className="p-2.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="PERMANENT DELETE"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
        isLoading={resolveMutation.isPending}
      />

      <ExaminationModal
        isOpen={!!examineId}
        onClose={() => setExamineId(null)}
        reportId={examineId}
      />
    </div>
  );
};

export default Reports;
