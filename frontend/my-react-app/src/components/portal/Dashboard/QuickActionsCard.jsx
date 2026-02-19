import { BookOpen, Users, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  {
    label: "Browse Roadmaps",
    icon: BookOpen,
    href: "/portal/roadmaps",
    color: "blue",
  },
  {
    label: "Join Discussion",
    icon: MessageCircle,
    href: "/portal/discussions",
    color: "green",
  },
  {
    label: "Explore Clubs",
    icon: Users,
    href: "/portal/clubs",
    color: "purple",
  },
];

const QuickActionsCard = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
        Quick Actions
      </h3>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={`flex items-center gap-3 p-3 rounded-xl hover:bg-${action.color}-50 transition-colors group`}
          >
            <action.icon className={`w-5 h-5 text-${action.color}-600`} />
            <span className="text-gray-700 group-hover:text-gray-900">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;
