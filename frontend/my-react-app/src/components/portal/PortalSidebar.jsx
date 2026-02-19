import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Users2,
  Globe,
  FolderOpen,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: "/portal/dashboard",
  },
  {
    id: "roadmaps",
    label: "Roadmaps",
    icon: <BookOpen className="w-5 h-5" />,
    href: "/portal/roadmaps",
  },
  {
    id: "discussions",
    label: "Discussions",
    icon: <MessageCircle className="w-5 h-5" />,
    href: "/portal/discussions",
  },
  {
    id: "groups",
    label: "Groups",
    icon: <Users2 className="w-5 h-5" />,
    href: "/portal/groups",
  },
  {
    id: "clubs",
    label: "Clubs",
    icon: <Globe className="w-5 h-5" />,
    href: "/portal/clubs",
  },
  {
    id: "resources",
    label: "Resources",
    icon: <FolderOpen className="w-5 h-5" />,
    href: "/portal/resources",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <User className="w-5 h-5" />,
    href: "/portal/profile",
  },
];

const PortalSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 px-5 py-8 shadow-sm">
      <nav className="space-y-2 text-sm">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold border border-blue-100"
                  : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-gray-600 hover:text-blue-600 hover:font-medium hover:border hover:border-gray-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-blue-500 group-hover:scale-125"
                    : "bg-gray-300 group-hover:bg-blue-400 group-hover:scale-125"
                }`}
              ></div>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Optional: quick stats or footer */}
      <div className="absolute bottom-8 left-5 right-5">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
          <p className="text-xs text-gray-600">Learning streak</p>
          <p className="text-sm font-medium text-blue-600">🔥 7 days</p>
        </div>
      </div>
    </aside>
  );
};

export default PortalSidebar;
