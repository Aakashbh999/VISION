import { useNotifications } from "../../hooks/useNotifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationRead,
  deleteNotification,
  clearNotifications,
} from "../../services/notifications";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { CheckCircle, X, Trash2 } from "lucide-react";

const Notifications = () => {
  const { data: notificationsPayload, isLoading, error } = useNotifications(50);
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

  const handleMarkRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load notifications</div>;

  const notifications = notificationsPayload?.data || [];
  const unread = notifications.filter((n) => !n.is_read);
  const read = notifications.filter((n) => n.is_read);

  return (
    <div className="space-y-6 px-2 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
          Notifications
        </h1>
        {notifications.length > 0 && (
          <button
            onClick={() => clearAllMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-[var(--text-muted)]">No notifications yet.</p>
      ) : (
        <>
          {/* Unread section */}
          {unread.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Unread ({unread.length})
              </h2>
              <div className="space-y-3">
                {unread.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className="bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800 rounded-xl p-4 flex items-start justify-between gap-4 relative group"
                  >
                    <div className="flex-1">
                      <p className="text-[var(--text-main)]">{notif.message}</p>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkRead(notif.notification_id)}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-1"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(notif.notification_id)}
                        className="text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 p-1 md:opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete notification"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Read section */}
          {read.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
                Read
              </h2>
              <div className="space-y-2">
                {read.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className="bg-[var(--bg-active)] rounded-xl p-4 text-[var(--text-muted)] flex items-start justify-between gap-4 relative group"
                  >
                    <div className="flex-1">
                      <p className="text-[var(--text-main)]">{notif.message}</p>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(notif.notification_id)}
                      className="text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 p-1 md:opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete notification"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Notifications;
