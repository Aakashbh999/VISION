import { useState, useEffect } from "react";
import { useRoadmaps } from "../../hooks/useRoadmaps";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UniversalSearch from "../../components/ui/UniversalSearch";
import SurfaceCard, {
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import {
  BookOpen,
  ChevronRight,
  Search,
  Map,
  CheckCircle2,
  Zap,
  Lock,
  Clock,
  AlertTriangle,
} from "lucide-react";

const get4DayCooldown = (leftAt) => {
  if (!leftAt) return null;
  const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
  const msLeft = FOUR_DAYS_MS - (Date.now() - new Date(leftAt).getTime());
  if (msLeft <= 0) return null;
  const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const Roadmaps = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
  });
  const [lockedTooltip, setLockedTooltip] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { data, isLoading, error } = useRoadmaps(filters);
  const roadmapsList = Array.isArray(data) ? data : data?.roadmaps || [];

  const activeRoadmap = roadmapsList.find(
    (r) => r.enrolment_status === "active",
  );
  const hasActiveRoadmap = !!activeRoadmap;

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
              <Map className="w-6 h-6 text-white" />
            </div>
            Learning Roadmaps
          </h1>
          <p className="text-[var(--text-muted)] font-medium ml-1">
            Expertly curated paths to master your next big skill.
          </p>
        </div>

        <div className="w-full md:w-80">
          <UniversalSearch
            placeholder="What do you want to learn?"
            initialValue={filters.search}
            onSearch={(val) => setFilters({ search: val })}
            isLoading={isLoading}
          />
        </div>
      </div>

      {}
      {hasActiveRoadmap && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 rounded-2xl">
          <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
            <span className="font-black uppercase tracking-wide">
              Focus Mode Active
            </span>{" "}
            — You're enrolled in{" "}
            <span className="font-black">"{activeRoadmap.title}"</span>.
            Complete or leave it to start a new one.
          </p>
        </div>
      )}

      <div className="min-h-[400px]">
        {isLoading ? (
          <LoadingSpinner className="py-24" />
        ) : error ? (
          <ErrorState
            title="Roadmaps unavailable"
            description="Failed to load roadmaps. Please try again."
            onRetry={() => window.location.reload()}
            className="rounded-3xl"
          />
        ) : roadmapsList.length === 0 ? (
          <SurfaceCard className="col-span-full border-dashed p-8 sm:p-16 lg:p-24 text-center">
            {data?.noResults ? (
              <div className="max-w-2xl mx-auto space-y-8 sm:space-y-10">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-purple-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-black text-[var(--text-main)] uppercase">
                    No paths for "{filters.search}"
                  </h3>
                  <p className="text-[var(--text-muted)] font-bold">
                    We don't have that roadmap yet, but these popular paths
                    might interest you:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {data.recommendations?.roadmaps?.map((rec) => (
                    <SurfaceCard
                      key={rec.id}
                      as={Link}
                      to={`/roadmaps/${rec.id}`}
                      variant="interactive"
                      padding="sm"
                      radius="md"
                      className="flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-(--bg-active) shadow-sm flex items-center justify-center text-purple-600 font-black group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-(--text-main) truncate group-hover:text-purple-600 transition-colors uppercase tracking-tight text-xs">
                          {rec.title}
                        </div>
                        <div className="text-[10px] font-black text-(--text-muted) uppercase tracking-widest mt-0.5">
                          {rec.difficulty || "Beginner"} Path
                        </div>
                      </div>
                    </SurfaceCard>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No Roadmaps Found"
                description="Try adjusting your search query."
              />
            )}
          </SurfaceCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mt-4">
            {roadmapsList.map((roadmap) => {
              const isActive = roadmap.enrolment_status === "active";
              const isCompleted = roadmap.enrolment_status === "completed";
              const isLeft = roadmap.enrolment_status === "left";
              const cooldown = get4DayCooldown(roadmap.left_at);
              const isInCooldown = isLeft && !!cooldown;

              const isLocked = hasActiveRoadmap && !isActive && !isCompleted;

              const cardContent = (
                <>
                  {}
                  {(isLocked || isInCooldown) && (
                    <div
                      className={`absolute top-4 right-4 z-20 p-2 backdrop-blur-md rounded-xl ${
                        isInCooldown
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "bg-slate-900/10 text-slate-500"
                      }`}
                    >
                      {isInCooldown ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                  )}

                  <CardHeader className="mb-4 relative">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                          : isCompleted
                            ? "bg-emerald-100 text-emerald-600"
                            : isInCooldown
                              ? "bg-amber-100 text-amber-600"
                              : isLocked
                                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                                : "bg-(--bg-active) text-(--text-muted) group-hover:bg-purple-600 group-hover:text-white"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <BookOpen className="w-6 h-6" />
                      )}
                    </div>

                    <div className="absolute top-0 right-0">
                      {isActive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                           In Progress
                        </span>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          <CheckCircle2 className="w-3 h-3" /> Mastery
                        </span>
                      )}
                      {isInCooldown && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          <Clock className="w-3 h-3" /> {cooldown}
                        </span>
                      )}
                      {isLocked && !isInCooldown && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </CardHeader>

                  <CardBody className="space-y-3">
                    <CardTitle
                      className={`text-lg sm:text-xl transition-colors uppercase tracking-tight ${
                        isLocked || isInCooldown
                          ? "text-[var(--text-muted)]"
                          : isActive || isCompleted
                            ? "text-(--text-main)"
                            : "text-(--text-main) group-hover:text-purple-600"
                      }`}
                    >
                      {roadmap.title}
                    </CardTitle>
                    <p className="text-sm text-(--text-muted) line-clamp-2 font-medium leading-relaxed">
                      {roadmap.description}
                    </p>
                    {isInCooldown && (
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Re-entry locked for {cooldown}
                      </p>
                    )}
                    {isLocked && !isInCooldown && (
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Finish your active roadmap first
                      </p>
                    )}
                  </CardBody>

                  <CardFooter className="flex items-center justify-between pt-4 sm:pt-6">
                    <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-(--bg-active) text-(--text-muted) uppercase tracking-widest">
                      {roadmap.difficulty_level || "Beginner"}
                    </span>
                    {!isLocked && !isInCooldown && (
                      <span className="text-purple-600 text-xs font-black flex items-center gap-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                        {isActive
                          ? "Continue Path"
                          : isCompleted
                            ? "Review Path"
                            : "Start Path"}{" "}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </CardFooter>
                </>
              );

              if (isLocked || isInCooldown) {
                return (
                  <div key={roadmap.roadmap_id} className="relative">
                    <SurfaceCard
                      className="p-5 sm:p-8 relative overflow-hidden opacity-60 cursor-not-allowed select-none grayscale-[0.4]"
                      onClick={() =>
                        setLockedTooltip(
                          isInCooldown
                            ? `You left this roadmap. Re-entry unlocks in ${cooldown}.`
                            : `Complete or leave "${activeRoadmap?.title}" first.`,
                        )
                      }
                    >
                      {cardContent}
                    </SurfaceCard>
                    {}
                    {lockedTooltip && (
                      <div
                        className="mt-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                        onClick={() => setLockedTooltip(null)}
                      >
                        {lockedTooltip}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <SurfaceCard
                  key={roadmap.roadmap_id}
                  as={Link}
                  to={`/roadmaps/${roadmap.roadmap_id}`}
                  variant="interactive"
                  className="p-5 sm:p-8 hover:shadow-2xl group hover:-translate-y-2 relative overflow-hidden"
                >
                  {cardContent}
                </SurfaceCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
