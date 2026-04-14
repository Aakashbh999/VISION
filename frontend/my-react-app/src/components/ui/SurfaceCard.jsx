const cx = (...classes) => classes.filter(Boolean).join(" ");

const variantStyles = {
  default: "bg-(--bg-card) border border-(--border-main) shadow-sm",
  subtle: "bg-(--bg-active) border border-(--border-main)/60 shadow-sm",
  elevated:
    "bg-(--bg-card) border border-(--border-main) shadow-lg shadow-purple-500/10",
  interactive:
    "bg-(--bg-card) border border-(--border-main) shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-200",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const radiusStyles = {
  md: "rounded-2xl",
  lg: "rounded-3xl",
};

const SurfaceCard = ({
  as: Component = "section",
  children,
  className = "",
  variant = "default",
  padding = "md",
  radius = "lg",
  interactive = false,
  ...props
}) => (
  <Component
    className={cx(
      "min-w-0",
      variantStyles[variant] || variantStyles.default,
      paddingStyles[padding] || paddingStyles.md,
      radiusStyles[radius] || radiusStyles.lg,
      interactive &&
        "focus-within:ring-2 focus-within:ring-purple-500/20 focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    {children}
  </Component>
);

export const CardHeader = ({ className = "", children }) => (
  <header className={cx("flex items-start justify-between gap-3 mb-4", className)}>
    {children}
  </header>
);

export const CardTitle = ({ className = "", children }) => (
  <h3
    className={cx(
      "text-sm font-black uppercase tracking-wider text-(--text-main)",
      className,
    )}
  >
    {children}
  </h3>
);

export const CardBody = ({ className = "", children }) => (
  <div className={cx("space-y-3", className)}>{children}</div>
);

export const CardFooter = ({ className = "", children }) => (
  <footer className={cx("mt-4 pt-4 border-t border-(--border-main)/50", className)}>
    {children}
  </footer>
);

export default SurfaceCard;
