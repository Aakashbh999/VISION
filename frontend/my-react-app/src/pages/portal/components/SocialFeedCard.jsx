import React from "react";
import { 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  Tag as TagIcon, 
  User, 
  Users, 
  BookOpen, 
  Megaphone,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const SocialFeedCard = ({ item }) => {
  const {
    actor_name,
    actor_profile_image,
    action_type,
    reference_type,
    reference_id,
    created_at,
    entity_title,
    metadata,
    is_following_actor,
    event_group_id
  } = item;

  // Action-specific UI config
  const getConfig = () => {
    switch (action_type) {
      case "group_notice_posted":
        return {
          icon: <Megaphone className="w-4 h-4 text-rose-500" />,
          label: "Notice",
          color: "border-rose-500/20 bg-rose-500/5",
          link: `/groups/${item.event_group_id || reference_id}/notices`
        };
      case "resource_uploaded":
        return {
          icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
          label: "Resource",
          color: "border-emerald-500/20 bg-emerald-500/5",
          link: `/library/${reference_id}`
        };
      case "discussion_created":
        return {
          icon: <MessageSquare className="w-4 h-4 text-sky-500" />,
          label: "Discussion",
          color: "border-sky-500/20 bg-sky-500/5",
          link: `/discussions/${reference_id}`
        };
      case "group_posted":
        return {
          icon: <Users className="w-4 h-4 text-purple-500" />,
          label: "Group Post",
          color: "border-purple-500/20 bg-purple-500/5",
          link: `/groups/${item.event_group_id || reference_id}`
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-slate-500" />,
          label: "Activity",
          color: "border-slate-500/20 bg-slate-500/5",
          link: "#"
        };
    }
  };

  const config = getConfig();

  // Fix broken links to match actual App routes
  const getCorrectLink = () => {
    switch (action_type) {
      case "group_notice_posted":
      case "group_posted":
        return `/groups/${event_group_id || reference_id}`;
      case "resource_uploaded":
        // App doesn't have a single resource page yet, search by title is best
        return `/resources?search=${encodeURIComponent(entity_title || "")}`;
      case "discussion_created":
        return `/discussions/${reference_id}`;
      default:
        return config.link;
    }
  };

  const finalLink = getCorrectLink();

  return (
    <Link to={finalLink} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-3xl overflow-hidden hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300"
      >
        <div className="p-5">
          {/* Header - Actor Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                {actor_profile_image ? (
                  <img 
                    src={actor_profile_image} 
                    alt={actor_name} 
                    loading="lazy"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[var(--border-main)]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 border-2 border-[var(--border-main)] flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-500" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-main)] text-sm sm:text-base transition-colors">
                    {actor_name || "User"}
                  </span>
                  {is_following_actor && (
                    <span className="text-[10px] bg-sky-500/10 text-sky-600 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">
                      Following
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {new Date(created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="text-[var(--text-muted)] group-hover:text-purple-500 transition-colors">
              <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>

          {/* Body - Content Info */}
          <div className="mb-2">
            <h3 className="text-base sm:text-lg font-black text-[var(--text-main)] leading-snug transition-colors">
              {entity_title}
            </h3>
            {metadata?.content && (
              <p className="mt-2 text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                {metadata.content}
              </p>
            )}
          </div>

          {/* Meta Tags */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-main)]/30">
            <div className="flex items-center gap-4">
               {metadata?.category && (
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)]">
                   <TagIcon className="w-3 h-3 text-purple-500" />
                   {metadata.category}
                 </div>
               )}
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  {config.icon}
                  {config.label}
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default SocialFeedCard;
