import { useState, useEffect } from "react";
import { useRoadmaps } from "../../hooks/useRoadmaps";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UniversalSearch from "../../components/ui/UniversalSearch";
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
    <div className="max-w-6xl mx-auto space-y-8 px-0 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
          <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-card)]/50 border border-[var(--border-main)] border-x-0 sm:border-x rounded-sm sm:rounded-[2.5rem]">
            <LoadingSpinner />
            <p className="mt-4 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">
              Mapping your future...
            </p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-12 rounded-sm sm:rounded-[2.5rem] text-center font-bold">
            Failed to load roadmaps. Please try again.
          </div>
        ) : roadmapsList.length === 0 ? (
          <div className="col-span-full bg-[var(--bg-card)] border border-dashed border-[var(--border-main)] rounded-sm sm:rounded-[2.5rem] p-10 sm:p-16 lg:p-24 text-center">
            {data?.noResults ? (
              <div className="max-w-2xl mx-auto space-y-10">
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
                    <Link
                      key={rec.id}
                      to={`/roadmaps/${rec.id}`}
                      className="group p-5 bg-[var(--bg-active)] border border-transparent hover:border-purple-200 hover:bg-[var(--bg-card)] hover:shadow-xl rounded-sm sm:rounded-2xl transition-all duration-300 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-sm sm:rounded-xl bg-white shadow-sm flex items-center justify-center text-purple-600 font-black group-hover:bg-purple-600 group-hover:text-white transition-all">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[var(--text-main)] truncate group-hover:text-purple-600 transition-colors uppercase tracking-tight text-xs">
                          {rec.title}
                        </div>
                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
                          {rec.difficulty || "Beginner"} Path
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-[var(--bg-active)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-2">
                  No roadmaps found
                </h3>
                <p className="text-[var(--text-muted)]">
                  Try adjusting your search query.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {roadmapsList.map((roadmap) => (
              <Link
                key={roadmap.roadmap_id}
                to={`/roadmaps/${roadmap.roadmap_id}`}
                className="bg-[var(--bg-card)] rounded-sm sm:rounded-[2rem] border border-[var(--border-main)] border-x-0 sm:border-x p-8 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 group shadow-sm hover:-translate-y-2"
              >
                <div className="w-14 h-14 rounded-sm sm:rounded-2xl bg-[var(--bg-active)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-purple-600 group-hover:text-white transition-all mb-6">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)] mb-3 group-hover:text-purple-600 transition-colors uppercase tracking-tight">
                  {roadmap.title}
                </h2>
                <p className="text-sm text-[var(--text-muted)] mb-6 line-clamp-2 font-medium leading-relaxed">
                  {roadmap.description}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border-main)]">
                  <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-[var(--bg-active)] text-[var(--text-muted)] uppercase tracking-widest">
                    {roadmap.difficulty_level || "Beginner"}
                  </span>
                  <span className="text-purple-600 text-xs font-black flex items-center gap-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                    Start Path <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;
