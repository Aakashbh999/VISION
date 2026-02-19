import { useRoadmaps } from "../../hooks/useRoadmaps";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { BookOpen, ChevronRight } from "lucide-react";

const Roadmaps = () => {
  const { data: roadmaps, isLoading, error } = useRoadmaps();

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load roadmaps</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Learning Roadmaps
      </h1>
      <p className="text-gray-600">
        Choose a roadmap to start your guided learning journey.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {roadmaps?.map((roadmap) => (
          <Link
            key={roadmap.roadmap_id}
            to={`/portal/roadmaps/${roadmap.roadmap_id}`}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {roadmap.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {roadmap.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {roadmap.difficulty_level || "Beginner"}
              </span>
              <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Roadmap <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Roadmaps;
