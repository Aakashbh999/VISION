import {
  Activity,
  BookOpen,
  Megaphone,
  MessageSquare,
  Users,
} from "lucide-react";

export const getFeedActivityConfig = (item) => {
  const { action_type: actionType, reference_id: referenceId } = item || {};

  switch (actionType) {
    case "group_notice_posted":
      return {
        icon: Megaphone,
        label: "Notice",
        iconClass: "text-rose-500",
        chipClass: "border-rose-500/20 bg-rose-500/5",
        link: `/groups/${item?.event_group_id || referenceId}`,
      };
    case "resource_uploaded":
      return {
        icon: BookOpen,
        label: "Resource",
        iconClass: "text-emerald-500",
        chipClass: "border-emerald-500/20 bg-emerald-500/5",
        link: `/resources?search=${encodeURIComponent(item?.entity_title || item?.metadata?.title || "")}`,
      };
    case "discussion_created":
      return {
        icon: MessageSquare,
        label: "Discussion",
        iconClass: "text-sky-500",
        chipClass: "border-sky-500/20 bg-sky-500/5",
        link: `/discussions/${referenceId}`,
      };
    case "group_posted":
      return {
        icon: Users,
        label: "Group Post",
        iconClass: "text-purple-500",
        chipClass: "border-purple-500/20 bg-purple-500/5",
        link: `/groups/${item?.event_group_id || referenceId}`,
      };
    default:
      return {
        icon: Activity,
        label: "Activity",
        iconClass: "text-slate-500",
        chipClass: "border-slate-500/20 bg-slate-500/5",
        link: "/feed",
      };
  }
};
