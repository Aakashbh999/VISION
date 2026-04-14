import { useState, useEffect, useMemo, createElement } from "react";
import { useGroups } from "../../../hooks/useGroupHooks";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import LazyGroupMemberAvatars from "../../../components/groups/LazyGroupMemberAvatars";
import { useUserStats } from "../../../hooks/useUserStats";
import {
  Users,
  Plus,
  Search,
  Sparkles,
  Clock,
  TrendingUp,
  Check,
  Zap,
  Lock,
  ArrowRight,
  ShieldAlert,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../services/api";
import { toast } from "react-toastify";
import UniversalSearch from "../../../components/ui/UniversalSearch";
import ForYouBadge from "../../discussions/components/ForYouBadge";
import SurfaceCard from "../../../components/ui/SurfaceCard";
import EmptyState from "../../../components/ui/EmptyState";
import ErrorState from "../../../components/ui/ErrorState";
import Button from "../../../components/ui/Button";

const Groups = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState(searchParams.get("sort") || "latest");
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "latest",
    degree: searchParams.get("degree") || "",
  });
  const [degrees, setDegrees] = useState([]);
  const [displayGroups, setDisplayGroups] = useState([]);
  const navigate = useNavigate();
  const { data: stats } = useUserStats();

  const userXP = stats?.total_xp || 0;
  const canCreateGroup = userXP >= 500;

  useEffect(() => {
    const fetchDegrees = async () => {
      try {
        const res = await api.get("/discussions/degrees");
        setDegrees(res.data || []);
      } catch (error) {
        console.error("Failed to fetch degrees:", error);
      }
    };
    fetchDegrees();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.sort !== "latest") params.set("sort", filters.sort);
    if (filters.degree) params.set("degree", filters.degree);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const { data, isLoading, isFetching, error } = useGroups({
    search: filters.search,
    sort: filters.sort,
    degree: filters.degree,
  });

  const groupsList = useMemo(
    () => (Array.isArray(data) ? data : data?.groups || []),
    [data],
  );

  useEffect(() => {
    if (!isFetching) {
      setDisplayGroups(groupsList);
    }
  }, [groupsList, isFetching]);

  const effectiveGroups =
    isFetching && displayGroups.length > 0 ? displayGroups : groupsList;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-16 sm:pb-20 px-2 sm:px-4">
      {/* Premium Header Section */}
      <div className="relative overflow-hidden bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-main)]/40 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-purple-500/5">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3"
            >
              <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                <Users className="w-8 h-8 text-white" />
              </div>
              Learning Circles
            </motion.h1>
            <p className="text-[var(--text-muted)] font-medium text-sm sm:text-base lg:text-lg ml-1">
              Connect, collaborate, and conquer complex topics together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border text-xs sm:text-sm font-black transition-all ${
                canCreateGroup
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-500/10"
                  : "bg-amber-50 border-amber-100 text-amber-700"
              }`}
            >
              <Zap
                className={`w-4 h-4 ${canCreateGroup ? "fill-emerald-500" : "fill-amber-500"}`}
              />
              {canCreateGroup
                ? "Creative Master Unlocked"
                : `${500 - userXP} VXP to Unlock Creator`}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => {
                  if (canCreateGroup) {
                    navigate("/groups/new");
                  } else {
                    toast.error(
                      `Unlock the Admin badge first! (${userXP}/500 VXP)`,
                    );
                  }
                }}
                variant={canCreateGroup ? "primary" : "outline"}
                className={`group px-6 sm:px-8 py-3 sm:py-3.5 font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shrink-0 ${
                  canCreateGroup
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/40 relative overflow-hidden"
                    : "bg-[var(--bg-active)] text-[var(--text-muted)] border border-[var(--border-main)]"
                }`}
              >
                {canCreateGroup ? (
                  <Plus className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                Start a Circle
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="mt-6 sm:mt-10 flex flex-col md:flex-row gap-3 sm:gap-4 p-1.5 sm:p-2 bg-[var(--bg-active)]/50 rounded-[2rem] border border-[var(--border-main)]/50 backdrop-blur-sm">
          <div className="flex-1">
            <UniversalSearch
              placeholder="Search by topic, group name, or mentor..."
              initialValue={filters.search}
              onSearch={(val) =>
                setFilters((prev) => ({ ...prev, search: val }))
              }
              isLoading={isLoading}
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filters.degree}
              disabled={isFetching}
              onChange={(e) => {
                const val = e.target.value;
                setSort(val === "" ? sort : sort);
                setFilters((prev) => ({ ...prev, degree: val }));
              }}
              className="min-w-0 flex-1 sm:flex-none bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl px-4 py-2 text-sm font-black text-[var(--text-main)] focus:outline-none focus:ring-4 focus:ring-purple-500/10 appearance-none cursor-pointer hover:border-purple-300 transition-all disabled:opacity-60 disabled:cursor-wait"
            >
              <option value="">All Branches</option>
              {degrees.map((deg) => (
                <option key={deg.id} value={deg.id}>
                  {deg.name}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-1 bg-[var(--bg-card)]/80 p-1 rounded-2xl border border-[var(--border-main)] shadow-sm">
              {[
                { value: "latest", label: "Recent", icon: Clock },
                { value: "joined", label: "Joined", icon: Check },
                { value: "popular", label: "Massive", icon: Users },
                { value: "recommended", label: "For You", icon: Sparkles },
              ].map(({ value, label, icon: SectionIcon }) => (
                <button
                  key={value}
                  disabled={isFetching}
                  onClick={() => {
                    setSort(value);
                    setFilters((prev) => ({ ...prev, sort: value }));
                  }}
                  className={`flex items-center gap-2 px-3 sm:px-5 py-2 text-xs font-black rounded-xl transition-all ${
                    sort === value
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-active)]"
                  } disabled:opacity-60 disabled:cursor-wait`}
                >
                  {createElement(SectionIcon, { className: "w-3.5 h-3.5" })}{" "}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Grid Layout */}
      <div className="min-h-[400px]">
        {isFetching && !isLoading && (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">
            <LoadingSpinner />
            Updating circles...
          </div>
        )}
        {isLoading ? (
          <SurfaceCard className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner />
            <p className="text-[var(--text-muted)] font-bold mt-4 uppercase tracking-widest text-xs">
              Summoning Circles...
            </p>
          </SurfaceCard>
        ) : error ? (
          <ErrorState
            title="Groups unavailable"
            description="Failed to load circles. Try again."
            onRetry={() => window.location.reload()}
            className="rounded-3xl"
          />
        ) : effectiveGroups.length === 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1"
          >
            <motion.div
              variants={itemVariants}
              className="text-center"
            >
              {data?.noResults ? (
                <div className="max-w-2xl mx-auto space-y-10 px-4 text-left">
                  <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Search className="w-10 h-10 text-purple-400" />
                  </div>
                  <div className="space-y-3 text-center">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">
                      No matches for "{filters.search}"
                    </h3>
                    <p className="text-[var(--text-muted)] font-bold text-sm sm:text-base lg:text-lg">
                      We couldn't find exactly that, but these growing circles
                      might be perfect for you:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.recommendations?.groups?.map((rec) => (
                      <Link
                        key={rec.id}
                        to={`/groups/${rec.id}`}
                        className="group p-6 bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-3xl hover:border-purple-200 hover:shadow-2xl transition-all duration-300 flex items-center gap-5"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-active)] flex items-center justify-center text-purple-600 font-black text-lg sm:text-xl shrink-0 group-hover:scale-110 transition-transform">
                          {rec.group_image ? (
                            <img
                              src={rec.group_image}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            rec.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-[var(--text-main)] truncate group-hover:text-purple-600 transition-colors uppercase tracking-tight text-sm">
                            {rec.name}
                          </div>
                          <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> {rec.member_count}{" "}
                            Members
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <SurfaceCard className="rounded-3xl p-12 sm:p-16">
                  <EmptyState
                    icon={Users}
                    title="No Circles Found"
                    description={
                      filters.search
                        ? "Try adjusting your filters or search terms."
                        : sort === "joined"
                          ? "You haven't engaged in any group yet."
                          : "The labyrinth is empty. Be the first to start a circle."
                    }
                  />
                </SurfaceCard>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial={false}
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center"
          >
            {effectiveGroups.map((group) => {
              const groupId = group.group_id ?? group.id;

              return (
                <motion.div
                  key={groupId}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group w-full max-w-none sm:max-w-sm"
                >
                  <Link
                    to={`/groups/${groupId}`}
                    className="relative block h-full bg-[var(--bg-card)]/70 backdrop-blur-xl border border-[var(--border-main)]/60 border-x-0 sm:border-x rounded-none sm:rounded-[2.5rem] overflow-hidden hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col group shadow-sm"
                  >
                    <div className="h-28 relative overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                      {group.banner_image && (
                        <img
                          src={group.banner_image}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
                        {(group.is_member || sort === "joined") && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
                            <Check className="w-3 h-3" /> Engaged
                          </span>
                        )}
                        {group.privacy_type === "request" && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
                            <ShieldAlert className="w-3 h-3" /> Request
                          </span>
                        )}
                        {group.privacy_type === "private" && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-2 sm:px-6 pb-4 sm:pb-6 -mt-10 relative flex-1 flex flex-col">
                      <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] p-1 shadow-lg mb-4 transition-transform">
                        <div className="w-full h-full rounded-full bg-[var(--bg-active)] border-2 border-[var(--border-main)] flex items-center justify-center text-[var(--text-main)] font-black text-xl sm:text-2xl overflow-hidden shadow-inner">
                          {group.group_image ? (
                            <img
                              src={group.group_image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            group.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 mb-4">
                        <h2 className="text-base sm:text-xl font-black text-[var(--text-main)] leading-snug">
                          {group.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 font-medium leading-relaxed">
                          {group.description ||
                            "Synthesizing collective knowledge through structured collaboration."}
                        </p>
                      </div>

                      <div className="mt-auto pt-6 border-t border-[var(--border-main)] flex items-center justify-between">
                        <LazyGroupMemberAvatars
                          groupId={groupId}
                          memberCount={group.members || 0}
                        />

                        <div className="w-10 h-10 rounded-2xl bg-[var(--bg-active)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--text-main)] group-hover:text-[var(--bg-card)] transition-all shadow-sm">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Groups;
