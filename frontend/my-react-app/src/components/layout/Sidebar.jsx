import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const Sidebar = () => {
  const menuItems = [
    { name: "Home", path: "/" },
    { name: "IT Specializations", path: "/it-fields" },
    { name: "Academic Guide", path: "/academic-guide" },
    { name: "Job Market", path: "/it-jobs" },
    { name: "Community", path: "/it-clubs" },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[var(--sidebar-bg)]/80 backdrop-blur-sm border-r border-[var(--border-main)] px-5 py-8 shadow-sm transition-colors duration-300">
      <nav className="space-y-2 text-sm relative">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "text-purple-600 dark:text-purple-400 font-semibold"
                  : "text-[var(--text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-purple-600 dark:hover:text-purple-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-[var(--sidebar-active-bg)] border border-purple-100 dark:border-purple-900/30 rounded-xl -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-8 left-5 right-5">
        <div className="p-4 rounded-xl bg-[var(--sidebar-active-bg)] border border-purple-100 dark:border-purple-900/30 transition-shadow duration-300">
          <p className="text-xs text-[var(--text-muted)]">Need guidance?</p>
          <a
            href="#"
            className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors duration-300 inline-flex items-center gap-1"
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