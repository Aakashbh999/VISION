import SkillTags from "../../components/ui/SkillTags";
import { useState, useEffect, useMemo } from "react";
import { useClubs } from "../../hooks/useClubHooks";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UniversalSearch from "../../components/ui/UniversalSearch";
import Pagination from "../../components/ui/Pagination";
import ClubAvatarLogo from "../../components/ui/ClubAvatarLogo";
import ForYouCarousel from "./clubs/ForYouCarousel";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, Building2 } from "lucide-react";
import SurfaceCard from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";

const specialtiesList = [
  "All", "Web", "AI", "Cyber", "Cloud", "Data", "Robotics", "Open Source",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

const Clubs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    specialty: searchParams.get("specialty") || "",
    institution: searchParams.get("institution") || "",
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.specialty && filters.specialty !== "All")
      params.set("specialty", filters.specialty);
    if (filters.institution) params.set("institution", filters.institution);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const { data: clubsData, isLoading, error } = useClubs({
    ...filters,
    page: currentPage,
    limit: 9,
  });

  const clubs = useMemo(() => {
    const all = clubsData?.clubs || [];
    if (!filters.specialty || filters.specialty === "All") return all;
    const selected = filters.specialty.toLowerCase().trim();
    return all.filter(
      (club) =>
        club.specialty &&
        club.specialty
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .some((tag) => tag.includes(selected)),
    );
  }, [clubsData, filters.specialty]);

  const pagination = clubsData?.pagination;
  const forYouClubs = useMemo(() => clubs.slice(0, 4), [clubs]);
  const activeSpecialty = filters.specialty || "All";

  useEffect(() => setCurrentPage(1), [filters.search, filters.specialty, filters.institution]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* Header */}
      <SurfaceCard className="relative bg-[var(--bg-card)]/40 backdrop-blur-xl border-[var(--border-main)]/40 p-5 sm:p-8 shadow-2xl shadow-purple-500/5 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight leading-tight flex items-center gap-3"
            >
              <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              Campus Hub
            </motion.h1>
            <p className="text-[var(--text-muted)] font-medium text-sm sm:text-base lg:text-lg ml-1">
              Find your community. Discover IT clubs and organizations.
            </p>
          </div>

          <div className="w-full md:w-96 shrink-0">
            <UniversalSearch
              placeholder="Search clubs, tags, or locations..."
              initialValue={filters.search}
              onSearch={(val) => setFilters({ ...filters, search: val })}
              isLoading={isLoading}
              className="w-full"
            />
          </div>
        </div>
      </SurfaceCard>

      {/* For You carousel */}
      {!isLoading && !error && !filters.search && (
        <ForYouCarousel clubs={forYouClubs} />
      )}

      {/* Specialty filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        {specialtiesList.map((s) => (
          <button
            key={s}
            onClick={() => setFilters({ ...filters, specialty: s === "All" ? "" : s })}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
              activeSpecialty === s
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-active)] hover:-translate-y-0.5"
            }`}
          >
            {s === "All" ? "All Clubs" : `#${s}`}
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <SurfaceCard className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner />
            <p className="text-[var(--text-muted)] font-bold mt-4 uppercase tracking-widest text-xs">
              Finding Communities...
            </p>
          </SurfaceCard>
        ) : error ? (
          <ErrorState
            title="Clubs unavailable"
            description="Failed to load clubs. Try again."
            onRetry={() => window.location.reload()}
          />
        ) : clubs?.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <SurfaceCard className="p-10 sm:p-16 lg:p-24 shadow-inner">
              <EmptyState
                icon={Search}
                title={`No Clubs Found${filters.specialty ? ` for "${filters.specialty}"` : filters.search ? ` for "${filters.search}"` : ""}`}
                description={
                  filters.specialty
                    ? "No clubs found for this tag on this page. Try checking other pages."
                    : "We couldn't find communities matching your criteria."
                }
              />
            </SurfaceCard>
          </motion.div>
        ) : (
          <motion.div
            key={`clubs-page-${currentPage}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {clubs.map((club) => (
              <motion.div key={club.id} variants={itemVariants} className="group h-full">
                <SurfaceCard
                  to={`/clubs/${club.slug}`}
                  as={Link}
                  variant="interactive"
                  className="relative h-full border-x-0 sm:border-x rounded-[2.5rem] p-5 sm:p-6 hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.15)] hover:border-purple-500/45 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <ClubAvatarLogo
                      club={club}
                      size="md"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="flex-1 min-w-0 pt-1">
                      <h2 className="font-black text-base sm:text-lg text-[var(--text-main)] group-hover:text-purple-600 transition-colors truncate">
                        {club.club_name}
                      </h2>
                      <div className="flex items-center gap-1.5 text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {club.location}
                          {club.institution ? ` · ${club.institution}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 flex text-sm text-[var(--text-muted)] font-medium line-clamp-2 leading-relaxed flex-1">
                    {club.description_full
                      ? club.description_full.substring(0, 100) + "..."
                      : "A technology community focusing on innovation and collaboration."}
                  </div>

                  <div className="flex items-center mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-[var(--border-main)]/80">
                    <SkillTags
                      skills={club.specialty || "General"}
                      badgeVariant="purple"
                      badgeTone="soft"
                      maxVisible={3}
                      className="text-[5px] font-black uppercase tracking-widest px-2 py-0.5"
                    />
                  </div>
                </SurfaceCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {!isLoading && !error && (pagination?.totalPages || 1) > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`,
        }}
      />
    </div>
  );
};

export default Clubs;
