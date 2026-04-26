import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCircle2, Trash2, X } from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { useClickOutside } from "../../hooks/useClickOutside";
import {
  formatNotificationMessage,
  resolveNotificationPath,
} from "../../utils/notificationRouting";
import {
  clearNotifications,
  deleteNotification,
  markNotificationRead,
} from "../../services/notifications";

const NotificationsPopup = ({ isOpen, onClose, toggleRef }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const panelRef = useRef(null);

  useClickOutside(panelRef, (event) => {
    if (!isOpen) return;
    // Don't close if we clicked the toggle button (it has its own toggle logic)
    if (toggleRef?.current?.contains(event.target)) return;
    onClose();
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const { data, isLoading, isError } = useNotifications({
    limit: 20,
    enabled: isOpen,
  });

  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidateNotifications,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidateNotifications,
  });

  const clearAllMutation = useMutation({
    mutationFn: clearNotifications,
    onSuccess: invalidateNotifications,
  });

  if (!isOpen) return null;

  const notifications = data?.data || [];

  const handleNotificationNavigate = async (notification) => {
    const destination = resolveNotificationPath(notification);

    if (!notification.is_read) {
      try {
        await markReadMutation.mutateAsync(notification.notification_id);
      } catch {
        // navigation can still proceed even if read state update fails
      }
    }

    if (destination) {
      onClose();
      navigate(destination);
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed inset-x-4 top-20 max-h-[80vh] sm:absolute sm:top-full sm:mt-2 sm:inset-auto sm:right-0 sm:w-[480px] sm:max-h-[70vh] z-50 rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] shadow-2xl flex flex-col"
      role="dialog"
      aria-label="Notifications popup"
    >
      <div className="flex items-center justify-between border-b border-[var(--border-main)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-[var(--text-main)]">Notifications</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-active)]"
        >
          <X className="w-3.5 h-3.5" />
          Close
        </button>
      </div>

      <div className="border-b border-[var(--border-main)] px-4 py-2.5">
        <div className="inline-flex items-center rounded-xl border border-[var(--border-main)] bg-[var(--bg-active)] p-1 text-xs font-semibold">
          <span className="rounded-lg bg-[var(--bg-card)] px-3 py-1 text-[var(--text-main)]">
            Recent
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/notifications");
            }}
            className="rounded-lg px-3 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            History
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">
            Loading notifications...
          </p>
        ) : isError ? (
          <p className="py-10 text-center text-sm text-rose-500">
            Failed to load notifications.
          </p>
        ) : notifications.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--text-muted)]">
            No recent notifications.
          </p>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notif) => (
              <div
                key={notif.notification_id}
                className={`rounded-xl border p-3 cursor-pointer transition-all duration-150 hover:shadow-sm ${
                  notif.is_read
                    ? "bg-[var(--bg-active)] border-[var(--border-main)] hover:bg-[var(--bg-main)]"
                    : "bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/70 dark:border-purple-800/70 hover:bg-purple-100/70 dark:hover:bg-purple-900/30"
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
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--text-main)]">
                      {formatNotificationMessage(notif)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notif.is_read && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          markReadMutation.mutate(notif.notification_id);
                        }}
                        className="rounded-md p-1 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        deleteMutation.mutate(notif.notification_id);
                      }}
                      className="rounded-md p-1 text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-[var(--border-main)] px-4 py-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/notifications");
            }}
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 text-left"
          >
            View full 7-day history
          </button>
          <button
            type="button"
            onClick={() => clearAllMutation.mutate()}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPopup;
