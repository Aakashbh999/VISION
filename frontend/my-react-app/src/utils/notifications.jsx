import { toast } from "react-toastify";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { createElement } from "react";

const toastConfig = {
  position: "bottom-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
  closeButton: true,
};

const CustomToastContent = ({ icon: Icon, title, message, type }) => (
  <div className="flex gap-3 items-start">
    {Icon && (
      <Icon
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
          type === "success"
            ? "text-emerald-600"
            : type === "error"
              ? "text-red-600"
              : type === "warning"
                ? "text-amber-600"
                : "text-blue-600"
        }`}
      />
    )}
    <div className="flex-1 space-y-1">
      {title && (
        <p className="font-black text-[var(--text-main)] text-sm">{title}</p>
      )}
      {message && (
        <p className="text-sm text-[var(--text-muted)] font-medium">
          {message}
        </p>
      )}
    </div>
  </div>
);

export const showSuccess = (message, options = {}) => {
  const { title = "Success", ...restOptions } = options;
  return toast.success(
    createElement(CustomToastContent, {
      icon: CheckCircle2,
      title,
      message,
      type: "success",
    }),
    { ...toastConfig, ...restOptions },
  );
};

export const showError = (message, options = {}) => {
  const { title = "Error", ...restOptions } = options;
  return toast.error(
    createElement(CustomToastContent, {
      icon: AlertCircle,
      title,
      message,
      type: "error",
    }),
    { ...toastConfig, ...restOptions },
  );
};

export const showWarning = (message, options = {}) => {
  const { title = "Warning", ...restOptions } = options;
  return toast.warning(
    createElement(CustomToastContent, {
      icon: AlertTriangle,
      title,
      message,
      type: "warning",
    }),
    { ...toastConfig, ...restOptions },
  );
};

export const showInfo = (message, options = {}) => {
  const { title = "Info", ...restOptions } = options;
  return toast.info(
    createElement(CustomToastContent, {
      icon: Info,
      title,
      message,
      type: "info",
    }),
    { ...toastConfig, ...restOptions },
  );
};

export const showLoading = (title, message) => {
  return toast.loading(
    createElement(CustomToastContent, {
      title,
      message,
    }),
    { ...toastConfig, autoClose: false, closeButton: false },
  );
};

export const updateToast = (toastId, options) => {
  return toast.update(toastId, { ...toastConfig, ...options });
};

export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const showNotification = {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  update: updateToast,
  dismiss: dismissToast,
};

export default showNotification;
