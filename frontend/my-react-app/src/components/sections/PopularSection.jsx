const PopularSection = () => {
  const popularItems = [
    {
      title: "Web Development",
      description:
        "Frontend, Backend, Full Stack paths with local opportunities.",
      icon: "🌐",
      color: "purple", // changed from blue to purple
      badge: "High Demand",
      bgClass: "bg-purple-50",
      borderClass: "border-purple-100",
      hoverBorderClass: "hover:border-purple-300",
      badgeBg: "bg-purple-100",
      badgeText: "text-purple-600",
      badgeHoverBg: "group-hover:bg-purple-600",
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-200",
    },
    {
      title: "Data Science",
      description: "AI, ML, Analytics - The future of tech careers in Nepal.",
      icon: "📊",
      color: "green",
      badge: "Growing Field",
      bgClass: "bg-green-50",
      borderClass: "border-green-100",
      hoverBorderClass: "hover:border-green-300",
      badgeBg: "bg-green-100",
      badgeText: "text-green-600",
      badgeHoverBg: "group-hover:bg-green-600",
      iconBg: "bg-gradient-to-br from-green-100 to-green-200",
    },
    {
      title: "XYZ IT Club",
      description: "Connect, learn, and grow with fellow IT enthusiasts.",
      icon: "👥",
      color: "orange",
      badge: "Active Community",
      bgClass: "bg-orange-50",
      borderClass: "border-orange-100",
      hoverBorderClass: "hover:border-orange-300",
      badgeBg: "bg-orange-100",
      badgeText: "text-orange-600",
      badgeHoverBg: "group-hover:bg-orange-600",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
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
          className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 transition-all duration-300"
        >
          View all trends →
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {popularItems.map((item, index) => (
          <div
            key={index}
            className={`group bg-gradient-to-br from-white ${item.bgClass} p-6 rounded-2xl border ${item.borderClass} ${item.hoverBorderClass} hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${item.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="text-lg sm:text-xl">{item.icon}</span>
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