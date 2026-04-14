import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * FormTextarea - Advanced textarea with character count and validation
 *
 * Props:
 * - label: Field label
 * - value: Current value
 * - onChange: Change handler
 * - error: Error message
 * - success: Success message
 * - hint: Helper text
 * - maxLength: Maximum characters
 * - rows: Number of rows (default: 4)
 * - required: Required indicator
 * - disabled: Disable input
 */
const FormTextarea = ({
  label,
  value = "",
  onChange,
  onBlur,
  error = null,
  success = null,
  hint = null,
  maxLength = null,
  rows = 4,
  required = false,
  disabled = false,
  id,
  className = "",
  placeholder = "",
  validation = {},
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState(null);
  const charCount = value.length;
  const charPercentage = maxLength ? (charCount / maxLength) * 100 : 0;
  const isNearLimit = charPercentage > 85;
  const isAtLimit = charPercentage >= 100;

  const validateField = (val) => {
    setLocalError(null);

    if (required && !val) {
      setLocalError("This field is required");
      return;
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      setLocalError(validation.patternMessage || "Invalid format");
      return;
    }

    if (validation.minLength && val.length < validation.minLength) {
      setLocalError(`Minimum ${validation.minLength} characters required`);
      return;
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      setLocalError(`Maximum ${validation.maxLength} characters allowed`);
      return;
    }

    if (validation.custom) {
      const customError = validation.custom(val);
      if (customError) {
        setLocalError(customError);
      }
    }
  };

  const displayError = error || localError;

  return (
    <motion.div
      className={`space-y-2 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Label with char count */}
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-black text-[var(--text-main)] uppercase tracking-widest"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        {maxLength && (
          <span
            className={`text-xs font-bold transition-colors ${
              isAtLimit
                ? "text-red-500"
                : isNearLimit
                  ? "text-amber-500"
                  : "text-[var(--text-muted)]"
            }`}
          >
            {charCount} / {maxLength}
          </span>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(event) => {
            onChange?.(event);
            validateField(event.target.value);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
            validateField(value);
          }}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            bg-[var(--bg-main)] text-[var(--text-main)] placeholder-[var(--text-muted)]
            outline-none font-medium resize-vertical
            ${
              displayError
                ? "border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/20"
                : success
                  ? "border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20"
                  : isFocused
                    ? "border-purple-500 focus:ring-4 focus:ring-purple-500/20"
                    : "border-[var(--border-main)] hover:border-[var(--border-main)]/70"
            }
            ${disabled ? "opacity-50 cursor-not-allowed bg-[var(--bg-active)]" : ""}
          `}
          {...props}
        />

        {/* Progress bar for character limit */}
        {maxLength && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl bg-[var(--bg-active)] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={`h-full transition-all ${
                isAtLimit
                  ? "bg-red-500"
                  : isNearLimit
                    ? "bg-amber-500"
                    : "bg-purple-500"
              }`}
              style={{ width: `${Math.min(charPercentage, 100)}%` }}
            />
          </motion.div>
        )}
      </div>

      {/* Error Message */}
      <AnimatePresence mode="wait">
        {displayError && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            role="alert"
            className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {displayError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence mode="wait">
        {success && !displayError && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            {typeof success === "string" ? success : "Looks good!"}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Helper Text */}
      {hint && !displayError && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[var(--text-muted)] font-medium"
        >
          {hint}
        </motion.p>
      )}
    </motion.div>
  );
};

export default FormTextarea;
