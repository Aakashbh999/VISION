import { useEffect } from "react";

const POLL_INTERVAL_MS = 15000;

export const useUserStatusPolling = (refetchUser, enabled = true) => {
  useEffect(() => {
    if (!enabled) return undefined;

    refetchUser();

    const intervalId = window.setInterval(() => {
      refetchUser();
    }, POLL_INTERVAL_MS);

    const handleFocus = () => {
      refetchUser();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, refetchUser]);
};
