import {
  Clock,
  Tag as TagIcon,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Avatar from "../../../components/ui/Avatar";
import Badge from "../../../components/ui/Badge";
import SurfaceCard, {
  CardBody,
  CardFooter,
  CardHeader,
} from "../../../components/ui/SurfaceCard";
import { getFeedActivityConfig } from "../../../utils/feedActivity";

const SocialFeedCard = ({ item }) => {
  const {
    actor_name,
    actor_profile_image,
    created_at,
    entity_title,
    metadata,
    is_following_actor,
  } = item;

  const config = getFeedActivityConfig(item);
  const ActivityIcon = config.icon;
  const finalLink = config.link;

  return (
    <Link to={finalLink} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="transition-all duration-300"
      >
        <SurfaceCard variant="interactive" className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar src={actor_profile_image} name={actor_name || "User"} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-(--text-main) text-sm sm:text-base transition-colors">
                    {actor_name || "User"}
                  </span>
                  {item.group_name && (
                    <Badge color="purple" size="xs">
                      {item.group_name}
                    </Badge>
                  )}
                  {is_following_actor && (
                    <span className="text-[10px] bg-sky-500/10 text-sky-600 px-1.5 py-0.5 rounded-md font-black uppercase tracking-tight">
                      Following
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-(--text-muted) font-bold uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {new Date(created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="text-(--text-muted) group-hover:text-purple-500 transition-colors">
              <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </CardHeader>

          <CardBody className="mb-2">
            <h3 className="text-base sm:text-lg font-black text-(--text-main) leading-snug transition-colors">
              {entity_title}
            </h3>
            {metadata?.content && (
              <p className="mt-2 text-sm text-(--text-muted) line-clamp-2 leading-relaxed">
                {metadata.content}
              </p>
            )}
          </CardBody>

          <CardFooter className="flex items-center justify-between mt-4 pt-4 border-(--border-main)/30">
            <div className="flex items-center gap-4">
              {metadata?.category && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-(--text-muted)">
                  <TagIcon className="w-3 h-3 text-purple-500" />
                  {metadata.category}
                </div>
              )}
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold text-(--text-muted) uppercase tracking-widest ${config.chipClass}`}
              >
                <ActivityIcon className={`w-3.5 h-3.5 ${config.iconClass}`} />
                {config.label}
              </div>
            </div>
          </CardFooter>
        </SurfaceCard>
      </motion.div>
    </Link>
  );
};

export default SocialFeedCard;
