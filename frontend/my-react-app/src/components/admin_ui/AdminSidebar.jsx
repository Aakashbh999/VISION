import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Clock, FileText, LogOut,
  ShieldAlert, Database, BookOpen, Briefcase,
  MonitorPlay, GraduationCap, Tag, Search, ChevronDown, ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar, SIDEBAR_WIDTH } from "../../hooks/useSidebar";
import { motion, AnimatePresence } from "framer-motion";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isCollapsed } = useSidebar();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({
    "Reference Data": false
  });

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const navCategories = [
    {
      title: "Core & Analytics",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { id: "reports", label: "Reports", icon: FileText, href: "/admin/reports" },
      ]
    },
    {
      title: "Users & Access",
      items: [
        { id: "pending", label: "Pending Approvals", icon: Clock, href: "/admin/pending" },
        { id: "students", label: "All Students", icon: Users, href: "/admin/students" },
        { id: "whitelist", label: "Reg. Whitelist", icon: ShieldAlert, href: "/admin/registration-whitelist" },
      ]
    },
    {
      title: "Content Management",
      items: [
        { id: "campuses", label: "Campuses", icon: LayoutDashboard, href: "/admin/campuses" },
        { id: "roadmaps", label: "Roadmap Builder", icon: FileText, href: "/admin/roadmaps" },
      ]
    },
    {
      title: "Reference Data",
      collapsible: true,
      items: [
        { id: "it-fields", label: "IT Fields", icon: Database, href: "/admin/reference/it-fields" },
        { id: "academic-degrees", label: "Academic Guide", icon: BookOpen, href: "/admin/reference/academic-degrees" },
        { id: "it-jobs", label: "IT Jobs", icon: Briefcase, href: "/admin/reference/it-jobs" },
        { id: "it-clubs", label: "IT Clubs", icon: MonitorPlay, href: "/admin/reference/it-clubs" },
        { id: "programs", label: "Programs", icon: GraduationCap, href: "/admin/reference/programs" },
        { id: "tags", label: "System Tags", icon: Tag, href: "/admin/reference/tags" },
      ]
    }
  ];

  if (user?.is_moderator || user?.role === "admin") {
    navCategories[2].items.push({
      id: "pending-resources",
      label: "Resource Queue",
      icon: FileText,
      href: "/admin/resources/pending",
    });
  }

  const filteredCategories = navCategories.map(category => {
    const filteredItems = category.items.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
      className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[var(--bg-card)]/90 backdrop-blur-sm border-r border-[var(--border-main)] shadow-sm z-30 overflow-hidden"
    >

      {}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 pb-2"
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-active)] border border-[var(--border-main)] rounded-xl py-2 pl-9 pr-3 text-sm text-[var(--text-main)] outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6 custom-scrollbar pb-24">
        {filteredCategories.map((category) => (
          <div key={category.title} className="space-y-1">
            {}
            {category.collapsible ? (
               <button
                 onClick={() => toggleCategory(category.title)}
                 className="flex items-center justify-between w-full px-2 py-1 mb-1 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase hover:text-[var(--text-main)] transition-colors"
               >
                 {!isCollapsed && <span>{category.title}</span>}
                 {!isCollapsed && (expandedCategories[category.title] || searchQuery ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
               </button>
            ) : (
               !isCollapsed && (
                 <h3 className="px-2 py-1 mb-1 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
                   {category.title}
                 </h3>
               )
            )}

            {}
            <AnimatePresence initial={false}>
              {(!category.collapsible || expandedCategories[category.title] || searchQuery) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-1 overflow-hidden"
                >
                  {category.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.id}
                        to={item.href}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                          isActive
                            ? "text-blue-700 dark:text-blue-300 font-semibold"
                            : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-blue-600 dark:hover:text-blue-300"
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="admin-sidebar-active-pill"
                            className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl -z-10"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                          />
                        )}
                        <item.icon
                          className={`w-4 h-4 shrink-0 relative z-10 transition-colors ${isActive ? "text-blue-600 dark:text-blue-400" : "text-[var(--text-muted)] group-hover:text-blue-500"}`}
                        />
                        {!isCollapsed && <span className="relative z-10 text-sm truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <p className="text-center text-sm text-[var(--text-muted)] py-4">No menu items found.</p>
        )}
      </div>

      {}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)] to-transparent pt-8">
        <button
          onClick={logout}
          title={isCollapsed ? "Logout" : undefined}
          className="flex items-center justify-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-active)] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 border border-[var(--border-main)] hover:border-red-200 dark:hover:border-red-800 rounded-xl transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
