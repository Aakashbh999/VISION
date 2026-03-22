import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menuItems = [
    { name: "Home", path: "/", icon: "" },
    { name: "IT Specializations", path: "/it-fields", icon: "" },
    { name: "Academic Guide", path: "/academic-guide", icon: "" },
    { name: "Job Market", path: "/it-jobs", icon: "" },
    { name: "Community", path: "/it-clubs", icon: "" },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-sidebar-bg/80 backdrop-blur-sm border-r border-border-main px-5 py-8 shadow-sm transition-colors duration-300">
      <nav className="space-y-2 text-sm">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-sidebar-active-bg text-blue-700 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/30"
                  : "hover:bg-sidebar-hover-bg text-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:font-medium hover:border hover:border-border-main"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-blue-500 scale-125"
                      : "bg-gray-300 group-hover:bg-blue-400 group-hover:scale-125"
                  }`}
                ></div>
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-8 left-5 right-5">
        <div className="p-4 rounded-xl bg-sidebar-active-bg border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-shadow duration-300">
          <p className="text-xs text-text-muted">Need guidance?</p>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-300 inline-flex items-center gap-1"
          >
            Chat with Mentor
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
