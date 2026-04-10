import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardStats,
  getModerationLogs,
} from "../../services/admin";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, color, delay }) => {
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
    yellow:
      "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10",
    green:
      "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
    red: "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10",
    orange:
      "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10",
    purple:
      "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-bg-card rounded-3xl border border-border-main p-6 flex items-center gap-5 hover:shadow-xl hover:shadow-purple-500/5 transition-all group"
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${colorMap[color]}`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-bold text-text-muted uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-black text-text-main mt-1 tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
};

const ActivityItem = ({ log, index }) => {
  const getActionStyles = (action) => {
    switch (action) {
      case "approve":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "reject":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "suspend":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "delete":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-bg-active/30 border border-border-main/50 hover:bg-bg-active transition-colors"
    >
      <div
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border whitespace-nowrap ${getActionStyles(log.action_type)}`}
      >
        {log.action_type}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-main truncate">
          {log.admin_name || "Admin"} {log.action_type}d {log.target_type}
        </p>
        <p className="text-[10px] text-text-muted font-medium uppercase tracking-tight">
          ID: {log.target_id} • {new Date(log.created_at).toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: getAdminDashboardStats,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["adminLogsSummary"],
    queryFn: () => getModerationLogs(1, 5),
  });

  if (statsLoading || logsLoading) return <LoadingSpinner />;

  const stats = statsData || {};
  const users = stats.users || {};
  const totalUsers =
    (parseInt(users.approved) || 0) +
    (parseInt(users.pending) || 0) +
    (parseInt(users.rejected) || 0) +
    (parseInt(users.suspended) || 0);
  const logs = Array.isArray(logsData) ? logsData : logsData?.data || [];

  const quickActions = [
    {
      label: "Verify Students",
      path: "/admin/pending",
      icon: Clock,
      color: "blue",
      count: users.pending,
    },
    {
      label: "Pending Materials",
      path: "/admin/resources/pending",
      icon: FileText,
      color: "purple",
    },
    {
      label: "Reports Desk",
      path: "/admin/reports",
      icon: AlertTriangle,
      color: "red",
      count: stats.reports_open,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">
            Admin <span className="text-purple-500">Dashboard</span>
          </h1>
          <p className="text-text-muted mt-2 font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            System Control Center • Monitoring active community activity
          </p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          color="blue"
          delay={0.1}
        />
        <StatCard
          title="Applications"
          value={users.pending || 0}
          icon={Clock}
          color="yellow"
          delay={0.2}
        />
        <StatCard
          title="Approved Students"
          value={users.approved || 0}
          icon={CheckCircle}
          color="green"
          delay={0.3}
        />
        <StatCard
          title="Rejected"
          value={users.rejected || 0}
          icon={XCircle}
          color="red"
          delay={0.4}
        />
        <StatCard
          title="Suspended"
          value={users.suspended || 0}
          icon={AlertTriangle}
          color="orange"
          delay={0.5}
        />
        <StatCard
          title="Active Reports"
          value={stats.reports_open || 0}
          icon={Activity}
          color="purple"
          delay={0.6}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-text-main tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Recent Moderation Logs
            </h2>
            <Link
              to="/admin/logs"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-widest flex items-center gap-1"
            >
              Full Audit Trail <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-bg-card border border-border-main rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <Activity className="w-12 h-12 text-text-muted/20 mx-auto" />
                  <p className="text-text-muted font-medium">
                    No recent moderation activity found.
                  </p>
                </div>
              ) : (
                <>
                  {logs.map((log, i) => (
                    <ActivityItem key={log.log_id} log={log} index={i} />
                  ))}
                  <div className="pt-4 border-t border-border-main/50">
                    <Link
                      to="/admin/logs"
                      className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold text-text-muted hover:text-text-main hover:bg-bg-active transition-all rounded-xl"
                    >
                      View All 50+ Log Entries
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Side Panel */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-text-main tracking-tight">
            Management Suite
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="flex items-center justify-between p-5 bg-bg-card border border-border-main rounded-2xl hover:border-purple-500/50 hover:bg-bg-active group transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-text-main block">
                      {action.label}
                    </span>
                    {parseInt(action.count) > 0 && (
                      <span className="text-[10px] font-bold text-rose-500 uppercase">
                        {action.count} ITEMS WAITING
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
