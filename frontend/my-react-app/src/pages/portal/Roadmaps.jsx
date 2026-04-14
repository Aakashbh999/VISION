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
import { BookOpen, ChevronRight, Search, Map } from "lucide-react";

const Roadmaps = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const { data, isLoading, error } = useRoadmaps(filters);
  const roadmapsList = Array.isArray(data) ? data : data?.roadmaps || [];

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

      <div className="min-h-[400px]">
        {isLoading ? (
          <SurfaceCard className="flex flex-col items-center justify-center py-16 sm:py-24">
            <LoadingSpinner />
            <p className="mt-4 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
              Mapping your future...
            </p>
          </SurfaceCard>
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
            {roadmapsList.map((roadmap) => (
              <SurfaceCard
                key={roadmap.roadmap_id}
                as={Link}
                to={`/roadmaps/${roadmap.roadmap_id}`}
                variant="interactive"
                className="p-5 sm:p-8 hover:shadow-2xl group hover:-translate-y-2"
              >
                <CardHeader className="mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-(--bg-active) flex items-center justify-center text-(--text-muted) group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </CardHeader>
                <CardBody className="space-y-3">
                  <CardTitle className="text-lg sm:text-xl text-(--text-main) group-hover:text-purple-600 transition-colors uppercase tracking-tight">
                    {roadmap.title}
                  </CardTitle>
                  <p className="text-sm text-(--text-muted) line-clamp-2 font-medium leading-relaxed">
                    {roadmap.description}
                  </p>
                </CardBody>
                <CardFooter className="flex items-center justify-between pt-4 sm:pt-6">
                  <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-(--bg-active) text-(--text-muted) uppercase tracking-widest">
                    {roadmap.difficulty_level || "Beginner"}
                  </span>
                  <span className="text-purple-600 text-xs font-black flex items-center gap-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                    Start Path <ChevronRight className="w-4 h-4" />
                  </span>
                </CardFooter>
              </SurfaceCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
