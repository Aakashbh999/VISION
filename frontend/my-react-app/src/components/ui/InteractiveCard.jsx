import { motion } from "framer-motion";

const InteractiveCard = ({
  children,
  onClick,
  className = "",
  variant = "default",
  disabled = false,
  ...props
}) => {
  const variantClasses = {
    default: "bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm",
    elevated:
      "bg-[var(--bg-card)] shadow-lg shadow-purple-500/10 border border-purple-100/20",
    outlined: "bg-transparent border border-[var(--border-main)]",
  };

  const baseClasses = `relative overflow-hidden rounded-xl transition-all ${variantClasses[variant]}`;

  const interactiveClasses =
    !disabled && onClick
      ? "cursor-pointer hover:shadow-lg hover:border-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
      : "";

  const finalClassName = `${baseClasses} ${interactiveClasses} ${className}`;

  const motionProps =
    !disabled && onClick
      ? {
          whileHover: { y: -4 },
          whileTap: { y: -2 },
          transition: { duration: 0.2 },
        }
      : {};

  return (
    <motion.div
      {...motionProps}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      onClick={onClick}
      className={finalClassName}
      aria-disabled={disabled}
      aria-label={onClick ? "Interactive card" : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default InteractiveCard;
