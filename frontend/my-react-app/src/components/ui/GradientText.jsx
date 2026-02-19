const GradientText = ({
  children,
  className = "",
  gradient = "from-blue-600 to-purple-600",
}) => {
  return (
    <span
      className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};

export default GradientText;
