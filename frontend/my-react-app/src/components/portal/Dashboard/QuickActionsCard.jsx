import { BookOpen, Users, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    label: "Browse Roadmaps",
    icon: BookOpen,
    href: "/roadmaps",
    bgHover: "hover:bg-blue-50",
    iconColor: "text-blue-600",
    hoverColor: "group-hover:text-blue-700",
  },
  {
    label: "Join Discussion",
    icon: MessageCircle,
    href: "/discussions",
    bgHover: "hover:bg-green-50",
    iconColor: "text-green-600",
    hoverColor: "group-hover:text-green-700",
  },
  {
    label: "Explore Clubs",
    icon: Users,
    href: "/clubs",
    bgHover: "hover:bg-purple-50",
    iconColor: "text-purple-600",
    hoverColor: "group-hover:text-purple-700",
  },
];

const QuickActionsCard = () => {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-main)] p-6">
      <h3 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Quick Actions
      </h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={`flex items-center gap-3 p-3 rounded-xl ${action.bgHover} transition-all duration-200 group`}
          >
            <action.icon
              className={`w-5 h-5 ${action.iconColor} ${action.hoverColor} transition-colors`}
            />
            <span
              className={`text-[var(--text-main)] ${action.hoverColor} transition-colors`}
            >
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;