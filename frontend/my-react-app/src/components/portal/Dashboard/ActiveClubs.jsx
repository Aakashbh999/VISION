import { Users } from "lucide-react";
import { Link } from "react-router-dom";

const ActiveClubs = ({ clubs }) => {
  if (!clubs?.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
          Active Clubs
        </h3>
        <p className="text-gray-600">No clubs yet – be the first to join!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
        Active Clubs
      </h3>
      <div className="space-y-4">
        {clubs.map((club) => (
          <Link
            key={club.club_id}
            to={`/clubs/${club.club_id}`}
            className="flex items-start justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div>
              <h4 className="font-medium text-gray-900">{club.name}</h4>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" /> {club.members} members
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActiveClubs;
