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
} from "lucide-react";
import { Link } from "react-router-dom";

const MobileMenu = ({ isOpen, onClose, variant, user }) => {
  // Public navigation items (for public mode)
  const publicNavItems = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="w-5 h-5" />,
      href: "/",
    },
    {
      id: "it-fields",
      label: "IT Fields",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/it-fields",
    },
    {
      id: "academic-guide",
      label: "Academic Guide",
      icon: <GraduationCap className="w-5 h-5" />,
      href: "/academic-guide",
    },
    {
      id: "it-jobs",
      label: "IT Jobs",
      icon: <Briefcase className="w-5 h-5" />,
      href: "/it-jobs",
    },
    {
      id: "it-clubs",
      label: "IT Clubs",
      icon: <Users className="w-5 h-5" />,
      href: "/it-clubs",
    },
  ];

  // Portal navigation items
  const portalNavItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart className="w-5 h-5" />,
      href: "/dashboard",
    },
    {
      id: "roadmaps",
      label: "Roadmaps",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/roadmaps",
    },
    {
      id: "discussions",
      label: "Discussions",
      icon: <MessageCircle className="w-5 h-5" />,
      href: "/discussions",
    },
    {
      id: "groups",
      label: "Groups",
      icon: <Users2 className="w-5 h-5" />,
      href: "/groups",
    },
    {
      id: "clubs",
      label: "Clubs",
      icon: <Users className="w-5 h-5" />,
      href: "/clubs",
    },
    {
      id: "resources",
      label: "Resources",
      icon: <FolderOpen className="w-5 h-5" />,
      href: "/resources",
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User className="w-5 h-5" />,
      href: "/profile",
    },
  ];

  // Public links for the "Public" section inside portal mobile menu
  const publicLinks = [
    { label: "Home", href: "/" },
    { label: "IT Fields", href: "/it-fields" },
    { label: "Academic Guide", href: "/academic-guide" },
    { label: "IT Jobs", href: "/it-jobs" },
    { label: "IT Clubs", href: "/it-clubs" },
  ];

  return (
    <div
      className={`mobile-menu fixed inset-0 z-40 lg:hidden ${isOpen ? "open" : ""}`}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="absolute left-0 top-16 bottom-0 w-64 bg-bg-main shadow-xl p-6 overflow-y-auto border-r border-border-main transition-colors duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-sidebar-hover-bg"
          aria-label="Close menu"
        >
          <X className="w-5 h-5 text-text-muted" />
        </button>

        {variant === "portal" && user ? (
          // Portal mobile menu
          <>
            <nav className="space-y-4 mt-8">
              {portalNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-hover-bg text-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:font-medium hover:border hover:border-border-main transition-all duration-300 w-full text-left"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Public section for portal users */}
            <div className="mt-8 pt-6 border-t border-border-main">
              <h4 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 px-4">
                Public Pages
              </h4>
              <nav className="space-y-2">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={onClose}
                    className="block px-4 py-2 text-sm text-text-main hover:bg-sidebar-hover-bg rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </>
        ) : (
          // Public mobile menu
          <>
            <nav className="space-y-4 mt-8">
              {publicNavItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sidebar-hover-bg text-text-muted hover:text-blue-600 dark:hover:text-blue-400 hover:font-medium hover:border hover:border-border-main transition-all duration-300 w-full text-left"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-border-main">
              <Link
                to="/register"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium mb-3"
              >
                Register
              </Link>
              <Link
                to="/login"
                onClick={onClose}
                className="block w-full text-center px-4 py-3 border border-border-main text-text-main hover:bg-sidebar-hover-bg rounded-lg font-medium"
              >
                Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
