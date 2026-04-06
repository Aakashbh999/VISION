import { useState, useRef, useEffect } from "react";
import api from "../../services/api";

const LazyGroupMemberAvatars = ({ groupId, memberCount = 0 }) => {
  const [members, setMembers] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const containerRef = useRef(null);

  // Load member data on demand (hover or viewport visibility)
  const loadMembers = async () => {
    if (members || isLoading) return;

    setIsLoading(true);
    try {
      const res = await api.get(`/groups/${groupId}/members?limit=3`);
      // Handle both response structures: array response or wrapped response
      const memberData = Array.isArray(res.data)
        ? res.data
        : res.data?.members || res.data?.data || [];
      setMembers(memberData);
      setShowAvatars(true);
    } catch (error) {
      console.error("Failed to load group members:", error);
      // Fall back to initials on error
      setShowAvatars(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Intersection Observer for viewport visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMembers();
          observer.disconnect();
        }
      },
      { rootMargin: "50px" },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [groupId]);

  const displayMembers = members || [];
  const displayCount = Math.min(3, memberCount);
  const remaining = memberCount - displayCount;

  return (
    <div
      ref={containerRef}
      className="flex items-center"
      onMouseEnter={loadMembers}
    >
      <div className="flex -space-x-3 overflow-hidden">
        {showAvatars && displayMembers.length > 0
          ? // Show actual member avatars
            displayMembers.map((member, i) => (
              <div
                key={member.user_id || i}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-card)] overflow-hidden border border-[var(--border-main)] flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0"
                title={member.full_name}
              >
                {member.profile_image ? (
                  <img
                    src={member.profile_image}
                    alt={member.full_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  member.full_name?.charAt(0)?.toUpperCase() || "?"
                )}
              </div>
            ))
          : // Show initials as placeholders
            [...Array(displayCount)].map((_, i) => (
              <div
                key={i}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-active)] border border-[var(--border-main)] flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] flex-shrink-0"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
      </div>

      <span className="ml-3 text-xs font-black text-[var(--text-muted)] uppercase tracking-tight whitespace-nowrap">
        {remaining > 0
          ? `+${remaining} collaborators`
          : `${memberCount} active`}
      </span>
    </div>
  );
};

export default LazyGroupMemberAvatars;
