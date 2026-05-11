import { useState, useCallback } from "react";
import { motion } from "framer-motion";

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

  const validateField = useCallback(
    (name, value) => {
      const fieldErrors = validate({ ...values, [name]: value });
      return fieldErrors[name] || null;
    },
    [values, validate],
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const newValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({ ...prev, [name]: newValue }));

      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField],
  );

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();

      const newErrors = validate(values);
      setErrors(newErrors);

      const newTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {},
      );
      setTouched(newTouched);

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

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

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
