const Button = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  className = "",
  as: Component = "button", // Allow custom component, default to button
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5",
    secondary:
      "border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-white hover:shadow-md hover:-translate-y-0.5",
    ghost: "bg-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50",
  };

  const sizes = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  return (
    <Component
      className={`
        rounded-xl font-medium transition-all duration-300 transform
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
