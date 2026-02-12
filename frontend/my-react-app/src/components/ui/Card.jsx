const Card = ({
  title,
  description,
  icon,
  color = "blue",
  link,
  linkText,
  className = "",
}) => {
  const colorVariants = {
    blue: {
      gradient: "from-blue-500 to-purple-500",
      border: "hover:border-blue-200",
      bg: "bg-gradient-to-br from-blue-100 to-purple-100",
      text: "text-blue-600",
    },
    green: {
      gradient: "from-green-500 to-blue-500",
      border: "hover:border-green-200",
      bg: "bg-gradient-to-br from-green-100 to-blue-100",
      text: "text-green-600",
    },
    orange: {
      gradient: "from-orange-500 to-red-500",
      border: "hover:border-orange-200",
      bg: "bg-gradient-to-br from-orange-100 to-red-100",
      text: "text-orange-600",
    },
    purple: {
      gradient: "from-purple-500 to-pink-500",
      border: "hover:border-purple-200",
      bg: "bg-gradient-to-br from-purple-100 to-pink-100",
      text: "text-purple-600",
    },
  };

  const variant = colorVariants[color] || colorVariants.blue;

  return (
    <div className="group relative">
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${variant.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`}
      ></div>
      <div
        className={`relative bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-200 hover:shadow-xl hover:-translate-y-2 transform transition-all duration-500 ${variant.border}`}
      >
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${variant.bg} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}
        >
          <span className="text-xl sm:text-2xl">{icon}</span>
        </div>
        <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-gray-800">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
        {link && linkText && (
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <a
              href={link}
              className={`${variant.text} text-xs sm:text-sm font-medium hover:${variant.text.replace("600", "800")} flex items-center gap-1`}
            >
              {linkText}
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
