import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import ClubAvatarLogo from "../../../components/ui/ClubAvatarLogo";

/**
 * ForYouCarousel — horizontal scrolling "For You" club strip.
 *
 * Props:
 *  clubs – array of club objects to display (max 4 already sliced by parent)
 */
const ForYouCarousel = ({ clubs = [] }) => {
  if (!clubs.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
          For You
        </h2>
      </div>

      <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-5 sm:pb-6 pt-2 px-2 snap-x hide-scrollbar">
        {clubs.map((club) => (
          <Link
            key={`foryou-${club.id}`}
            to={`/clubs/${club.slug}`}
            className="snap-start shrink-0 w-80 group relative bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2rem] p-5 sm:p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/40 transition-all duration-300"
          >
            <div className="flex flex-col items-center text-center space-y-4 mt-4">
              <ClubAvatarLogo
                club={club}
                size="lg"
                rounded="rounded-full"
                className="group-hover:scale-105 transition-transform duration-300"
              />
              <div>
                <h3 className="font-black text-base sm:text-lg text-[var(--text-main)] group-hover:text-purple-600 transition-colors line-clamp-1">
                  {club.club_name}
                </h3>
                <p className="text-sm font-medium text-[var(--text-muted)] mt-1">
                  {club.specialty || "General Tech"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ForYouCarousel;
