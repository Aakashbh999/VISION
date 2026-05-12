import {
  X,
  Home,
  BookOpen,
  Briefcase,
  Users,
  GraduationCap,
  BarChart,
  MessageCircle,
  Users2,
  FolderOpen,
  User,
  LayoutDashboard,
  Clock,
  FileText,
  ShieldAlert,
  Database,
  MonitorPlay,
  Tag,
  ChevronDown,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const MobileMenu = ({ isOpen, onClose, variant, user }) => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [expandedCategories, setExpandedCategories] = useState({
    "Reference Data": false
  });

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };
  const accountStatusLabel =
    authUser?.role === "admin"
      ? null
      : authUser?.email_status !== "verified"
        ? "Email not verified"
        : authUser?.student_status !== "approved"
          ? "Approval pending"
          : null;
  const accountStatusRoute =
    authUser?.role === "admin"
      ? null
      : authUser?.email_status !== "verified"
        ? "/verify-email"
        : authUser?.student_status !== "approved"
          ? "/pending-approval"
          : null;

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/");
  };

  const handleLogoutWithConfirm = () => {
    const shouldLogout = window.confirm("Are you sure you want to logout?");
    if (shouldLogout) {
      handleLogout();
    }
  };

  const publicNavItems = [
    { id: "home", label: "Home", href: "/" },
    { id: "it-fields", label: "IT Specializations", href: "/it-fields" },
    { id: "academic-guide", label: "Academic Guide", href: "/academic-guide" },
    { id: "it-jobs", label: "Job Market", href: "/it-jobs" },
    { id: "it-clubs", label: "Community", href: "/it-clubs" },
  ];

  const portalNavItems = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    { id: "roadmaps", label: "Roadmaps", href: "/roadmaps" },
    { id: "discussions", label: "Discussions", href: "/discussions" },
    { id: "groups", label: "Groups", href: "/groups" },
    { id: "clubs", label: "Clubs", href: "/clubs" },
    { id: "resources", label: "Resources", href: "/resources" },
    { id: "profile", label: "Profile", href: "/profile" },
  ];

  const adminNavCategories = [
    {
      title: "Core & Analytics",
      items: [
        { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { id: "reports", label: "Reports", icon: FileText, href: "/admin/reports" },
      ]
    },
    {
      title: "Users & Access",
      items: [
        { id: "pending-approvals", label: "Pending Approvals", icon: Clock, href: "/admin/pending" },
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

  if (authUser?.is_moderator || authUser?.role === "admin") {

    adminNavCategories[2].items.push({
      id: "pending-resources",
      label: "Resource Queue",
      icon: FileText,
      href: "/admin/resources/pending",
    });
  }

  const publicLinks = [
    { label: "Home", href: "/" },
    { label: "IT Specializations", href: "/it-fields" },
    { label: "Academic Guide", href: "/academic-guide" },
    { label: "Job Market", href: "/it-jobs" },
    { label: "Community", href: "/it-clubs" },
  ];

  return (
    <div
      className={`mobile-menu fixed inset-0 z-40 lg:hidden ${isOpen ? "open" : ""}`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="absolute left-0 top-16 bottom-0 w-64 bg-[var(--bg-main)] shadow-xl p-6 overflow-y-auto custom-scrollbar border-r border-[var(--border-main)] transition-colors duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[var(--bg-active)]"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-[var(--text-muted)]" />
        </button>

        {variant === "admin" && user ? (

          <>
            <nav className="mt-8 space-y-6 pb-20">
              {adminNavCategories.map((category) => (
                <div key={category.title} className="space-y-1">
                  {category.collapsible ? (
                    <button
                      onClick={() => toggleCategory(category.title)}
                      className="flex items-center justify-between w-full px-4 py-2 mb-1 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase hover:text-blue-600 transition-colors"
                    >
                      <span>{category.title}</span>
                      {expandedCategories[category.title] ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  ) : (
                    <h3 className="px-4 py-2 mb-1 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
                      {category.title}
                    </h3>
                  )}

                  {(!category.collapsible || expandedCategories[category.title]) && (
                    <div className="space-y-1">
                      {category.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={onClose}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-muted)] hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-300 transition-all duration-300 w-full group"
                        >
                          <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-blue-500" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </>
        ) : variant === "portal" && user ? (

          <>
            <nav className="space-y-4 mt-8">
              {portalNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center px-4 py-3 rounded-xl hover:bg-[var(--bg-active)] text-[var(--text-muted)] hover:text-purple-600 dark:hover:text-purple-400 hover:font-medium transition-all duration-300 w-full text-left"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-[var(--border-main)]">
              <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 px-4">
                Public Pages
              </h4>
              <nav className="space-y-2">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-active)] rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </>
        ) : (

          <>
            <nav className="space-y-4 mt-8">
              {publicNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center px-4 py-3 rounded-xl hover:bg-[var(--bg-active)] text-[var(--text-muted)] hover:text-purple-600 dark:hover:text-purple-400 hover:font-medium transition-all duration-300 w-full text-left"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-[var(--border-main)]">
              {authUser ? (
                <>
                  {accountStatusLabel && (
                    <Link
                      to={accountStatusRoute || "/"}
                      onClick={onClose}
                      className="mb-3 block w-full text-center px-3 py-2 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors"
                    >
                      {accountStatusLabel}
                    </Link>
                  )}
                  <button
                    onClick={handleLogoutWithConfirm}
                    className="block w-full text-center px-4 py-3 border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-active)] rounded-lg font-medium"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-medium mb-3"
                  >
                    Register
                  </Link>
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="block w-full text-center px-4 py-3 border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-active)] rounded-lg font-medium"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
