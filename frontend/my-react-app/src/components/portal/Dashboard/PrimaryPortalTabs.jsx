import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { id: "dashboard", label: "Dashboard", to: "/dashboard" },
  { id: "feed", label: "Feed", to: "/feed" },
];

const PrimaryPortalTabs = ({ activeTab }) => {
  return (
    <div className="inline-flex items-center rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isActive
                ? "text-white"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="portal-primary-tab"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-500 via-sky-500 to-purple-500"
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default PrimaryPortalTabs;
