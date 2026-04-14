import { Activity, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SurfaceCard, {
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/SurfaceCard";
import { getFeedActivityConfig } from "../../../utils/feedActivity";

const ViewFullFeedButton = () => (
  <Link
    to="/feed"
    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-(--bg-active) border border-(--border-main) text-(--text-main) text-sm font-bold hover:border-purple-400 hover:bg-(--bg-card) transition-all"
  >
    View full feed
  </Link>
);

const ActivityFeedWidget = ({ feed }) => {
  if (!feed?.length) {
    return (
      <SurfaceCard>
        <CardHeader className="mb-6">
          <CardTitle className="flex items-center gap-2 text-(--text-muted)">
            <Activity className="w-5 h-5 text-purple-600" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-0">
          <div className="py-8 text-center bg-(--bg-active)/50 rounded-2xl border border-dashed border-(--border-main)">
           <p className="text-sm font-bold text-(--text-muted)">The feed is quiet right now.</p>
          </div>
        </CardBody>
        <CardFooter className="mt-6 pt-0 border-0">
          <ViewFullFeedButton />
        </CardFooter>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard>
      <CardHeader className="mb-6">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" /> Recent Activity
        </CardTitle>
      </CardHeader>

      <CardBody className="space-y-4">
        {feed.slice(0, 5).map((item, index) => {
          const config = getFeedActivityConfig(item);
          const link = config.link;
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
                <div className="p-2.5 rounded-xl bg-(--bg-active) border border-(--border-main) shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className={`w-4 h-4 ${config.iconClass}`} />
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
                    {config.label} •{" "}
                    {item.entity_title || item.metadata?.title || "New update"}
                  </p>
                </div>

                <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-purple-600" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </CardBody>

      <CardFooter className="mt-6 pt-6 border-(--border-main)/50">
        <Link
          to="/feed"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-purple-600 text-white text-sm font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
        >
          Explore Full Feed
        </Link>
      </CardFooter>
    </SurfaceCard>
  );
};

export default ActivityFeedWidget;
