import { useRef, useEffect } from "react";

export const useAutoFocus = (shouldFocus = true, selector = null) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!shouldFocus) return;

    const timer = setTimeout(() => {
      const element = selector ? document.querySelector(selector) : ref.current;
      element?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [shouldFocus, selector]);

  return ref;
};

export const useFocusTrap = (elementRef, isActive = true) => {
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [elementRef, isActive]);
};

export const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title;

    const announcement = document.querySelector('[role="status"]');
    if (announcement) {
      announcement.textContent = title;
    }
  }, [title]);
};

export const useSkipLink = () => {
  useEffect(() => {
    const handleSkip = (e) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const mainContent =
          document.querySelector("main") || document.querySelector("section");
        mainContent?.focus();
        mainContent?.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("keydown", handleSkip);
    return () => window.removeEventListener("keydown", handleSkip);
  }, []);
};

export const useAnnounce = () => {
  const announceRef = useRef(null);

  useEffect(() => {
    const announce = document.createElement("div");
    announce.setAttribute("role", "status");
    announce.setAttribute("aria-live", "polite");
    announce.setAttribute("aria-atomic", "true");
    announce.style.position = "absolute";
    announce.style.left = "-9999px";
    announce.style.width = "1px";
    announce.style.height = "1px";
    announce.style.overflow = "hidden";
    document.body.appendChild(announce);
    announceRef.current = announce;

    return () => announce.remove();
  }, []);

  const announce = (message) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  };

  return announce;
};
