
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
      {}
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

      {}
      {children && typeof children.type !== "string" ? (
        children
      ) : (
        <>{children}</>
      )}

      {}
      {helperText && !error && (
        <p
          id={helperId}
          className="text-xs text-[var(--text-muted)] font-medium"
        >
          {helperText}
        </p>
      )}

      {}
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
