const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled = false,
  as: Component = "button",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-4 flex-shrink-0";

  const variants = {
    primary:
      "bg-purple-700 text-white hover:bg-purple-800 focus:ring-purple-500/20 rounded-xl",
    shiny:
      "bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 shadow-lg shadow-purple-500/20 focus:ring-purple-500/20 rounded-xl",
    secondary:
      "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 focus:ring-slate-100 rounded-xl",
    ghost:
      "bg-transparent text-purple-700 hover:bg-purple-50 hover:text-purple-800 focus:ring-purple-100 rounded-xl",
    danger:
      "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500/20 rounded-xl",
    gradient:
      "px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-[1.02]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px] gap-1.5",
    md: "px-5 py-2.5 text-xs gap-2",
    lg: "px-8 py-4 text-sm gap-3",
  };

  return (
    <Component
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </Component>
  );
};

export default Button;