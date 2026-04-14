import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

/**
 * FormInput - Advanced form input with validation feedback
 *
 * Props:
 * - label: Field label text
 * - type: Input type (text, email, password, number, etc.)
 * - value: Current input value
 * - onChange: Change handler
 * - onBlur: Blur handler
 * - error: Error message (if any)
 * - success: Success message or boolean
 * - hint: Helper text below input
 * - required: Show required indicator
 * - disabled: Disable the input
 * - icon: Lucide icon component
 * - validation: Validation rules { pattern, minLength, maxLength, custom }
 * - id: Input ID (for accessibility)
 */
const FormInput = forwardRef(
  (
    {
      label,
      type = "text",
      value,
      onChange,
      onBlur,
      error = null,
      success = null,
      hint = null,
      required = false,
      disabled = false,
      icon: Icon = null,
      validation = {},
      id,
      className = "",
      placeholder = "",
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState(null);

    // Real-time validation
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
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;
    const hasControlledValue = value !== undefined;

    return (
      <motion.div
        className={`space-y-2 ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-black text-[var(--text-main)] uppercase tracking-widest"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <Icon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={id}
            type={inputType}
            {...(hasControlledValue ? { value } : {})}
            onChange={(e) => {
              onChange?.(e);
              validateField(e.target.value);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
              validateField(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            disabled={disabled}
            placeholder={placeholder}
            className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            bg-[var(--bg-main)] text-[var(--text-main)] placeholder-[var(--text-muted)]
            outline-none font-medium
            ${Icon ? "pl-10" : "pl-4"}
            ${isPassword && showPassword ? "pr-10" : isPassword ? "pr-10" : "pr-4"}
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

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Right Icon - Success/Error */}
          {(displayError || success) && !isPassword && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              {displayError ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
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
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
