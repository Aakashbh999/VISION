/**
 * Accessible Form Field Wrapper
 * Provides consistent labeling, error handling, and ARIA attributes
 *
 * Props:
 * - label: Field label text (required)
 * - error: Error message (optional)
 * - helperText: Additional context text
 * - required: Whether field is required
 * - disabled: Whether field is disabled
 * - children: FormInput component
 * - id: Field ID (required for accessibility)
 */
const AccessibleFormField = ({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  children,
  id,
  className = "",
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText ? `${id}-help` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ");

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label
        htmlFor={id}
        className="block text-sm font-black text-[var(--text-main)] uppercase tracking-wider"
      >
        {label}
        {required && (
          <span
            className="ml-1 text-red-500"
            aria-label="required"
            title="This field is required"
          >
            *
          </span>
        )}
      </label>

      {/* Input Field - Clone to add accessibility props */}
      {children && typeof children.type !== "string" ? (
        children
      ) : (
        <>{children}</>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p
          id={helperId}
          className="text-xs text-[var(--text-muted)] font-medium"
        >
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-bold text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AccessibleFormField;
