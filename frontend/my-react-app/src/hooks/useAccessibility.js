

export const useFocusVisible = () => {
  return {
    focusVisible:
      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-[var(--bg-main)]",
    focusRing:
      "ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-[var(--bg-main)]",
  };
};

export const useKeyboardNavigation = (
  onEnter,
  onEscape,
  onArrowDown,
  onArrowUp,
) => {
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        onEnter?.();
        break;
      case "Escape":
        e.preventDefault();
        onEscape?.();
        break;
      case "ArrowDown":
        e.preventDefault();
        onArrowDown?.();
        break;
      case "ArrowUp":
        e.preventDefault();
        onArrowUp?.();
        break;
      default:
        break;
    }
  };

  return { handleKeyDown };
};

export const useAriaLabel = (label, ariaDescribedBy) => {
  return {
    "aria-label": label,
    ...(ariaDescribedBy && { "aria-describedby": ariaDescribedBy }),
  };
};

export const useLiveRegion = (message, assertive = false) => {
  return {
    role: "status",
    "aria-live": assertive ? "assertive" : "polite",
    "aria-atomic": "true",
    children: message,
  };
};
