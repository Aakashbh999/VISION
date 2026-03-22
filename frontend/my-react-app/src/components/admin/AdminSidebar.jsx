import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Clock, FileText, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      id: "pending",
      label: "Pending Approvals",
      icon: Clock,
      href: "/admin/pending",
    },
    {
      id: "students",
      label: "All Students",
      icon: Users,
      href: "/admin/students",
    },
    { id: "reports", label: "Reports", icon: FileText, href: "/admin/reports" },
  ];

  if (user?.is_moderator || user?.role === "admin") {
    navItems.splice(2, 0, {
      id: "pending-resources",
      label: "Resource Queue",
      icon: FileText,
      href: "/admin/resources/pending",
    });
  }


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
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-8 left-5 right-5">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
