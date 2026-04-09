import { Globe, BarChart3, Users } from "lucide-react";

const PopularSection = () => {
  const popularItems = [
    {
      title: "Web Development",
      description:
        "Frontend, Backend, Full Stack paths with local opportunities.",
      icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />,
      color: "blue",
      badge: "High Demand",
      bgClass: "bg-blue-50 dark:bg-blue-950/30",
      borderClass: "border-blue-100 dark:border-blue-800",
      hoverBorderClass: "hover:border-blue-300 dark:hover:border-blue-700",
      badgeBg: "bg-blue-100 dark:bg-blue-900",
      badgeText: "text-blue-600 dark:text-blue-300",
      badgeHoverBg: "group-hover:bg-blue-600 dark:group-hover:bg-blue-700",
      iconBg:
        "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50",
    },
    {
      title: "Data Science",
      description: "AI, ML, Analytics - The future of tech careers in Nepal.",
      icon: <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />,
      color: "green",
      badge: "Growing Field",
      bgClass: "bg-green-50 dark:bg-green-950/30",
      borderClass: "border-green-100 dark:border-green-800",
      hoverBorderClass: "hover:border-green-300 dark:hover:border-green-700",
      badgeBg: "bg-green-100 dark:bg-green-900",
      badgeText: "text-green-600 dark:text-green-300",
      badgeHoverBg: "group-hover:bg-green-600 dark:group-hover:bg-green-700",
      iconBg:
        "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50",
    },
    {
      title: "XYZ IT Club",
      description: "Connect, learn, and grow with fellow IT enthusiasts.",
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />,
      color: "orange",
      badge: "Active Community",
      bgClass: "bg-orange-50 dark:bg-orange-950/30",
      borderClass: "border-orange-100 dark:border-orange-800",
      hoverBorderClass: "hover:border-orange-300 dark:hover:border-orange-700",
      badgeBg: "bg-orange-100 dark:bg-orange-900",
      badgeText: "text-orange-600 dark:text-orange-300",
      badgeHoverBg: "group-hover:bg-orange-600 dark:group-hover:bg-orange-700",
      iconBg:
        "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50",
    },
  ];

  return (
    <section className="">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
          Popular Right Now
        </h2>
        <a
          href="#"
          className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center gap-2 transition-all duration-300"
        >
          View all trends →
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {popularItems.map((item, index) => (
          <div
            key={index}
            className={`group bg-gradient-to-br from-[var(--bg-card)] ${item.bgClass} p-6 rounded-sm sm:rounded-2xl border ${item.borderClass} ${item.hoverBorderClass} hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${item.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
              </div>
              <span
                className={`px-2 sm:px-3 py-1 rounded-full ${item.badgeBg} ${item.badgeText} text-xs font-medium ${item.badgeHoverBg} group-hover:text-white transition-colors duration-300`}
              >
                {item.badge}
              </span>
            </div>
            <h4 className="font-bold text-base sm:text-lg text-[var(--text-main)] mb-1 sm:mb-2">
              {item.title}
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularSection;
