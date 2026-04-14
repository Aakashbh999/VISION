import { useState, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * useForm - Hook for managing form state, validation, and submission
 *
 * Usage:
 * const { values, errors, touched, handleChange, handleBlur, handleSubmit } = useForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => { ... },
 *   validate: (values) => { ... }
 * })
 */
export const useForm = ({
  initialValues = {},
  onSubmit = () => {},
  validate = () => ({}),
  onError = () => {},
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate field
  const validateField = useCallback(
    (name, value) => {
      const fieldErrors = validate({ ...values, [name]: value });
      return fieldErrors[name] || null;
    },
    [values, validate],
  );

  // Handle change
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({ ...prev, [name]: newValue }));

      // Real-time validation
      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField],
  );

  // Handle blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Handle submit
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      // Validate all fields
      const newErrors = validate(values);
      setErrors(newErrors);

      // Mark all fields as touched
      const newTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
      );
      setTouched(newTouched);

      // Check if valid
      const hasErrors = Object.values(newErrors).some((err) => err);
      if (!hasErrors) {
        setIsValid(true);
        setIsSubmitting(true);

        try {
          await onSubmit(values);
        } catch (error) {
          onError(error);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setIsValid(false);
      }
    },
    [values, validate, onSubmit, onError],
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  // Set field value
  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
};

/**
 * FormContainer - Wraps form with consistent styling and error display
 */
export const FormContainer = ({
  children,
  onSubmit,
  isLoading = false,
  className = "",
  ...props
}) => (
  <motion.form
    onSubmit={onSubmit}
    className={`space-y-6 ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    {...props}
  >
    {children}
  </motion.form>
);

/**
 * FormFieldGroup - Groups multiple fields together
 */
export const FormFieldGroup = ({
  children,
  label = null,
  className = "",
  columns = 1,
}) => (
  <div
    className={`grid grid-cols-1 ${
      columns > 1 ? `md:grid-cols-${columns}` : ""
    } gap-4 ${className}`}
  >
    {label && (
      <h3 className="col-span-full text-sm font-black text-[var(--text-main)] uppercase tracking-widest">
        {label}
      </h3>
    )}
    {children}
  </div>
);

/**
 * FormActions - Standard form buttons (Submit, Cancel, Reset)
 */
export const FormActions = ({
  onSubmit = () => {},
  onCancel = () => {},
  onReset = () => {},
  submitText = "Submit",
  cancelText = "Cancel",
  resetText = "Reset",
  isLoading = false,
  showReset = false,
  className = "",
}) => (
  <div className={`flex gap-3 justify-end ${className}`}>
    {showReset && (
      <button
        type="button"
        onClick={onReset}
        disabled={isLoading}
        className="px-6 py-3 bg-[var(--bg-active)] hover:bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] font-black rounded-xl transition-all disabled:opacity-50"
      >
        {resetText}
      </button>
    )}

    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-6 py-3 bg-[var(--bg-card)] hover:bg-[var(--bg-active)] border border-[var(--border-main)] text-[var(--text-main)] font-black rounded-xl transition-all disabled:opacity-50"
      >
        {cancelText}
      </button>
    )}

    <button
      type="submit"
      onClick={onSubmit}
      disabled={isLoading}
      className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {submitText}
    </button>
  </div>
);

export default useForm;
