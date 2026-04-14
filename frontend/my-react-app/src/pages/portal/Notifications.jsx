import { useNotifications } from "../../hooks/useNotifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markNotificationRead,
  deleteNotification,
  clearNotifications,
} from "../../services/notifications";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { CalendarClock, CheckCircle2, Trash2 } from "lucide-react";
import {
  formatNotificationMessage,
  resolveNotificationPath,
} from "../../utils/notificationRouting";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const { data: notificationsPayload, isLoading, error } = useNotifications({
    limit: 100,
    sinceDays: 7,
  });
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

  const handleNotificationNavigate = async (notification) => {
    const destination = resolveNotificationPath(notification);

    if (!notification.is_read) {
      try {
        await markReadMutation.mutateAsync(notification.notification_id);
      } catch {
        // allow navigation even if read update fails
      }
    }

    if (destination) {
      navigate(destination);
    }
  };

  const notifications = notificationsPayload?.data || [];
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const groupedNotifications = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  notifications.forEach((notif) => {
    const createdAt = new Date(notif.created_at);
    if (createdAt >= todayStart) {
      groupedNotifications.today.push(notif);
    } else if (createdAt >= yesterdayStart) {
      groupedNotifications.yesterday.push(notif);
    } else {
      groupedNotifications.earlier.push(notif);
    }
  });

  const sections = [
    { key: "today", title: "Today", items: groupedNotifications.today },
    { key: "yesterday", title: "Yesterday", items: groupedNotifications.yesterday },
    {
      key: "earlier",
      title: "Earlier (last 7 days)",
      items: groupedNotifications.earlier,
    },
  ].filter((section) => section.items.length > 0);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load notifications</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
            Notification History
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Your last 7 days of activity.
          </p>
        </div>
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

      {sections.length === 0 ? (
        <p className="text-[var(--text-muted)]">No notifications yet.</p>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.key}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <CalendarClock className="w-4 h-4" />
                {section.title}
              </h2>
              <div className="space-y-2.5">
                {section.items.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className={`rounded-xl border p-4 flex items-start justify-between gap-4 cursor-pointer transition-all duration-150 hover:shadow-sm ${
                      notif.is_read
                        ? "bg-[var(--bg-active)] border-[var(--border-main)] hover:bg-[var(--bg-main)]"
                        : "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:bg-purple-100/70 dark:hover:bg-purple-900/30"
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationNavigate(notif)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleNotificationNavigate(notif);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--text-main)]">
                        {formatNotificationMessage(notif)}
                      </p>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!notif.is_read && (
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleMarkRead(notif.notification_id);
                          }}
                          className="text-purple-600 hover:text-purple-700 p-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleDelete(notif.notification_id);
                        }}
                        className="text-[var(--text-muted)] hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
