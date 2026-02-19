import { useParams } from "react-router-dom";
import { useClub } from "../../hooks/useClub";
import { useJoinClub } from "../../hooks/useJoinClub";
import { useLeaveClub } from "../../hooks/useLeaveClub";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { ChevronLeft, MapPin, Tag, Users, Mail, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const ClubDetail = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useClub(id);
  const joinMutation = useJoinClub(id);
  const leaveMutation = useLeaveClub(id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-red-500">Failed to load club</div>;

  const { club, members } = data;

  // Check if current user is a member (you'll need user context)
  // For now, we'll assume user is not a member
  const isMember = false; // Replace with actual check

  const handleJoin = () => {
    joinMutation.mutate();
  };

  const handleLeave = () => {
    leaveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Link
        to="/portal/clubs"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Clubs
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {club.club_name}
            </h1>
            <div className="space-y-2 mt-4 text-gray-600">
              <p>{club.description}</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>
                  {club.location}{" "}
                  {club.institution ? `- ${club.institution}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <span>{club.specialty}</span>
              </div>
              {club.contact_info && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${club.contact_info}`}
                    className="text-blue-600 hover:underline"
                  >
                    {club.contact_info}
                  </a>
                </div>
              )}
              {club.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a
                    href={club.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {club.website}
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            {isMember ? (
              <button
                onClick={handleLeave}
                disabled={leaveMutation.isLoading}
                className="px-5 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {leaveMutation.isLoading ? "Leaving..." : "Leave Club"}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joinMutation.isLoading}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {joinMutation.isLoading
                  ? "Joining..."
                  : club.is_public
                    ? "Join Club"
                    : "Apply to Join"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" /> Members ({members.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg"
            >
              {member.full_name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubDetail;
