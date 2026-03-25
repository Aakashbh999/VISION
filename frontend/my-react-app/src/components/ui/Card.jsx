import { Link } from "react-router-dom";

const Card = ({ title, description, icon, color = "blue", link, linkText }) => {
  const colorVariants = {
    blue: {
      gradient: "from-blue-500 to-purple-500",
      border: "hover:border-blue-200",
      bg: "bg-gradient-to-br from-blue-100 to-purple-100",
      text: "text-blue-600",
      hoverText: "text-blue-800",
    },
    green: {
      gradient: "from-green-500 to-blue-500",
      border: "hover:border-green-200",
      bg: "bg-gradient-to-br from-green-100 to-blue-100",
      text: "text-green-600",
      hoverText: "text-green-800",
    },
    orange: {
      gradient: "from-orange-500 to-red-500",
      border: "hover:border-orange-200",
      bg: "bg-gradient-to-br from-orange-100 to-red-100",
      text: "text-orange-600",
      hoverText: "text-orange-800",
    },
    purple: {
      gradient: "from-purple-500 to-pink-500",
      border: "hover:border-purple-200",
      bg: "bg-gradient-to-br from-purple-100 to-pink-100",
      text: "text-purple-600",
      hoverText: "text-purple-800",
    },
  };

  const variant = colorVariants[color] || colorVariants.blue;

  return (
    /* h-full here ensures the glow wrapper fills the grid height */
    <div className="group relative h-full">
      <div
        className={`absolute -inset-0.5 bg-linear-to-r ${variant.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500`}
      ></div>

      {/* Deep Navy theme-aware card */}
      <div
        className={`relative h-full flex flex-col bg-bg-card dark:bg-bg-card p-5 sm:p-6 lg:p-7 rounded-2xl border border-border-main dark:border-border-main hover:shadow-xl hover:-translate-y-2 transform transition-all duration-500 ${variant.border} hover:bg-bg-active dark:hover:bg-bg-active`}
      >
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${variant.bg} shrink-0 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 dark:bg-blue-500/10 dark:border dark:border-blue-500/20`}
        >
          <span className="text-xl sm:text-2xl text-text-main dark:text-text-main">
            {icon}
          </span>
        </div>

        <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-text-main dark:text-text-main">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted leading-relaxed grow">
          {description}
        </p>

        {link && linkText && (
          <div
            className={`mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-border-main dark:border-border-main transition-all duration-300 ${"lg:opacity-0 lg:group-hover:opacity-100"}`}
          >
            <Link
  to={link}
  className={`text-purple-600 text-xs sm:text-sm font-medium hover:text-purple-800 flex items-center gap-1`}
>
              {linkText}
              <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
