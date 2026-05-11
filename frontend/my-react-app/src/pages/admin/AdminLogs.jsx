import { useQuery } from "@tanstack/react-query";
import { getModerationLogs } from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShieldCheck,
  AlertCircle,
  UserX,
  Trash2,
  CheckCircle2,
  Activity
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const AdminLogs = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 20;

  const { data, isLoading, error } = useQuery({
    queryKey: ["moderationLogs", page],
    queryFn: () => getModerationLogs(page, limit),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-rose-500 font-bold">Failed to load audit logs.</div>;

  const logs = data?.data || [];
  const pagination = data?.pagination || { totalPages: 1 };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.admin_name?.toLowerCase().includes(term) ||
      log.action_type?.toLowerCase().includes(term) ||
      log.target_type?.toLowerCase().includes(term) ||
      String(log.target_id).toLowerCase().includes(term) ||
      String(log.log_id).toLowerCase().includes(term)
    );
  });

  const getActionIcon = (action) => {
    switch (action) {
      case 'approve': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'reject': return <FileText className="w-5 h-5 text-rose-500" />;
      case 'suspend': return <UserX className="w-5 h-5 text-orange-500" />;
      case 'delete': return <Trash2 className="w-5 h-5 text-rose-500" />;
      case 'reactivate': return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      default: return <Activity className="w-5 h-5 text-purple-500" />;
    }
  };

  const getActionBg = (action) => {
    switch (action) {
      case 'approve': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'reject': return 'bg-rose-500/10 border-rose-500/20';
      case 'suspend': return 'bg-orange-500/10 border-orange-500/20';
      case 'delete': return 'bg-rose-500/10 border-rose-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-text-main tracking-tight flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-2xl">
              <History className="w-8 h-8 text-purple-600" />
            </div>
            System Audit Trail
          </h1>
          <p className="text-text-muted mt-2 font-medium">
            Permanent record of all moderation and administrative interventions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Filter these logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-main rounded-xl text-sm focus:border-purple-500 outline-none transition-colors shadow-sm"
            />
          </div>
          <div className="px-5 py-2.5 bg-bg-card border border-border-main rounded-2xl shadow-sm text-xs font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Immutable Integrity Active
          </div>
        </div>
      </div>

      {}
      <div className="bg-bg-card border border-border-main rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-left">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-active/50 border-b border-border-main">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Event ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Administrator</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Action Taken</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Target Entity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main/50">
              {filteredLogs.length === 0 ? (
                <tr>
                    <td colSpan="5" className="px-6 py-20 text-center text-text-muted font-medium italic">
                        {searchTerm ? "No logs matching your search on this page." : "No audit logs available for this period."}
                    </td>
                </tr>
              ) : filteredLogs.map((log, idx) => (
                  <motion.tr
                    key={log.log_id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-bg-active/30 transition-colors group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <code className="text-[11px] font-black text-text-muted opacity-60">#{log.log_id}</code>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] font-black text-purple-600 uppercase border border-purple-500/20">
                            {log.admin_name?.charAt(0) || 'A'}
                         </div>
                         <span className="text-sm font-bold text-text-main">{log.admin_name || 'System Admin'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${getActionBg(log.action_type)}`}>
                        {getActionIcon(log.action_type)}
                        {log.action_type}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-main capitalize">{log.target_type}</span>
                          <span className="text-[10px] font-mono text-text-muted opacity-80">REF: {log.target_id}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-main">
                                {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-text-muted font-medium">
                                {new Date(log.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </td>
                  </motion.tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-6 border-t border-border-main flex items-center justify-between">
            <p className="text-xs font-bold text-text-muted">
              Showing <span className="text-text-main">{logs.length}</span> entries on this page
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 bg-bg-active border border-border-main rounded-xl disabled:opacity-30 hover:bg-bg-main transition-all text-text-muted hover:text-text-main"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 min-w-[3rem] justify-center">
                  <span className="text-xs font-black text-text-main">{page}</span>
                  <span className="text-xs font-bold text-text-muted">/</span>
                  <span className="text-xs font-bold text-text-muted">{pagination.totalPages}</span>
              </div>

              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 bg-bg-active border border-border-main rounded-xl disabled:opacity-30 hover:bg-bg-main transition-all text-text-muted hover:text-text-main"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      <div className="flex items-center justify-center gap-4 text-xs font-bold text-text-muted/40 uppercase tracking-[0.2em]">
          <AlertCircle className="w-4 h-4" />
          Audit Trail is Permanent and Irreversible
      </div>
    </div>
  );
};

export default AdminLogs;
