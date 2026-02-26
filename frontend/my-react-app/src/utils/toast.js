import { toast } from "react-toastify";

const hashString = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return String(h);
};

const showOnce = (type, message, options = {}) => {
  const text = typeof message === "string" ? message : JSON.stringify(message);
  const toastId = options.toastId ?? `${type}-${hashString(text)}`;
  if (!toast.isActive(toastId)) {
    const opts = { toastId, ...options };
    if (type === "success") return toast.success(message, opts);
    if (type === "error") return toast.error(message, opts);
    if (type === "info") return toast.info(message, opts);
    return toast(message, opts);
  }
  return null;
};

export const toastSuccess = (message, options) =>
  showOnce("success", message, options);
export const toastError = (message, options) =>
  showOnce("error", message, options);
export const toastInfo = (message, options) =>
  showOnce("info", message, options);
