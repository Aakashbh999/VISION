import { Bell, CheckCircle, X, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationRead,
  deleteNotification,
  clearNotifications,
} from "../../../services/notifications";

const NotificationsWidget = ({ notifications }) => {
  const queryClient = useQueryClient();

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: clearNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  if (!notifications?.length) {
    return (
      <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Notifications
        </h3>
        <p className="text-[var(--text-muted)]">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4" /> Latest Notifications
        </h3>
        <button
          onClick={() => clearAllMutation.mutate()}
          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Clear all notifications"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>
      <div className="space-y-3 flex-1">
        {notifications.slice(0, 5).map((notif) => (
          <div
            key={notif.notification_id}
            className={`p-3 rounded-xl flex flex-col justify-center relative group transition-colors ${
              notif.is_read
                ? "bg-[var(--bg-active)]"
                : "bg-purple-50 dark:bg-purple-950/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2 pr-6">
              <div className="flex-1">
                <p className="text-sm text-[var(--text-main)]">
                  {notif.message}
                </p>
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(notif.created_at).toLocaleDateString()}
                </span>
              </div>
              {!notif.is_read && (
                <button
                  onClick={() => markReadMutation.mutate(notif.notification_id)}
                  className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 shrink-0 mt-1"
                  title="Mark as read"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {}
            <button
              onClick={() => deleteMutation.mutate(notif.notification_id)}
              className="absolute top-2 right-2 p-1 text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md opacity-0 group-hover:opacity-100 transition-all"
              title="Delete notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Link
        to="/notifications"
        className="block text-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 mt-4"
      >
        View all notifications
      </Link>
    </div>
  );
};

export default NotificationsWidget;
