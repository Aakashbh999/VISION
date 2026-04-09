import { Activity, MessageSquare, BookOpen, Megaphone, Users, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ViewFullFeedButton = () => (
  <Link
    to="/feed"
    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-active) border border-(--border-main) text-(--text-main) text-sm font-bold hover:border-purple-400 hover:bg-(--bg-card) transition-all"
  >
    View full feed
  </Link>
);

const getActionConfig = (actionType) => {
  switch (actionType) {
    case "group_notice_posted":
      return { icon: Megaphone, color: "text-rose-500 bg-rose-500/10", label: "Notice" };
    case "resource_uploaded":
      return { icon: BookOpen, color: "text-emerald-500 bg-emerald-500/10", label: "Resource" };
    case "discussion_created":
      return { icon: MessageSquare, color: "text-sky-500 bg-sky-500/10", label: "Discussion" };
    case "group_posted":
      return { icon: Users, color: "text-purple-500 bg-purple-500/10", label: "Post" };
    default:
      return { icon: Activity, color: "text-slate-500 bg-slate-500/10", label: "Activity" };
  }
};

const getCorrectLink = (item) => {
  const { action_type, reference_id, metadata, event_group_id } = item;
  switch (action_type) {
    case "group_notice_posted":
    case "group_posted":
      return `/groups/${event_group_id || reference_id}`;
    case "resource_uploaded":
      const title = metadata?.title || "resource";
      return `/resources?search=${encodeURIComponent(title)}`;
    case "discussion_created":
      return `/discussions/${reference_id}`;
    default:
      return "/feed";
  }
};

const ActivityFeedWidget = ({ feed }) => {
  if (!feed?.length) {
    return (
      <div className="bg-(--bg-card) rounded-3xl border border-(--border-main) p-6 shadow-sm">
        <h3 className="text-sm font-black text-(--text-muted) uppercase tracking-widest mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" /> Recent Activity
        </h3>
        <div className="py-8 text-center bg-(--bg-active)/50 rounded-2xl border border-dashed border-(--border-main)">
           <p className="text-sm font-bold text-(--text-muted)">The feed is quiet right now.</p>
        </div>
        <div className="mt-6">
          <ViewFullFeedButton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--bg-card) rounded-3xl border border-(--border-main) p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black text-(--text-main) uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" /> Recent Activity
        </h3>
      </div>

      <div className="space-y-4">
        {feed.slice(0, 5).map((item, index) => {
          const config = getActionConfig(item.action_type);
          const link = getCorrectLink(item);
          const Icon = config.icon;

          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.activity_id}
            >
              <Link
                to={link}
                className="group flex items-start gap-4 p-3 -mx-2 rounded-2xl hover:bg-(--bg-active) transition-all duration-300"
              >
                <div className={`p-2.5 rounded-xl ${config.color} shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-xs font-black text-(--text-main) truncate transition-colors">
                      {item.actor_name || "User"}
                    </p>
                    <span className="text-[10px] text-(--text-muted) font-bold shrink-0">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-[13px] text-(--text-muted) line-clamp-1 leading-snug">
                    {item.action_type.split('_').pop().toUpperCase()} • {item.entity_title || item.metadata?.title || "New update"}
                  </p>
                </div>

                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-purple-600" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-(--border-main)/50">
        <Link
          to="/feed"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-purple-600 text-white text-sm font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
        >
          Explore Full Feed
        </Link>
      </div>
    </div>
  );
};

export default ActivityFeedWidget;
