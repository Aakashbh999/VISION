const GradientText = ({
  children,
  className = "",
  gradient = "from-purple-600 to-purple-800",
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