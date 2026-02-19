import { useGroups } from "../../hooks/useGroups";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Users, Plus } from "lucide-react";

const Groups = () => {
  const { data: groups, isLoading, error } = useGroups();

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <div className="p-8 text-red-500">Failed to load groups</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Learning Groups
          </h1>
          <p className="text-gray-600 mt-1">
            Join groups to collaborate and learn together.
          </p>
        </div>
        <Link
          to="/portal/groups/new"
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Group
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups?.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-12">
            No groups yet. Create the first one!
          </p>
        ) : (
          groups?.map((group) => (
            <Link
              key={group.group_id}
              to={`/portal/groups/${group.group_id}`}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {group.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {group.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      Created by {group.creator}
                    </span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                      {group.members} members
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Groups;
