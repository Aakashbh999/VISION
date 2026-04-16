import SkillTags from "../../components/ui/SkillTags";
import { useState, useEffect, useMemo } from "react";
import { useClubs } from "../../hooks/useClubHooks";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UniversalSearch from "../../components/ui/UniversalSearch";
import Pagination from "../../components/ui/Pagination";
import { motion } from "framer-motion";
import { Search, MapPin, Tag, Sparkles, Zap, Building2 } from "lucide-react";
import SurfaceCard from "../../components/ui/SurfaceCard";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";

const specialtiesList = [
  "All",
  "Web",
  "AI",
  "Cyber",
  "Cloud",
  "Data",
  "Robotics",
  "Open Source",
];

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

  const {
    data: clubsData,
    isLoading,
    error,
  } = useClubs({
    ...filters,
    page: currentPage,
    limit: 9,
  });

  // Filter clubs by specialty if a filter is selected (frontend-only)
  const clubs = useMemo(() => {
    const allClubs = clubsData?.clubs || [];
    if (!filters.specialty || filters.specialty === "All") return allClubs;
    const selected = filters.specialty.toLowerCase().trim();
    return allClubs.filter(
      (club) =>
        club.specialty &&
        club.specialty
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .some((tag) => tag.includes(selected)),
    );
  }, [clubsData, filters.specialty]);
  const pagination = clubsData?.pagination;

  const activeSpecialty = filters.specialty || "All";

  const forYouClubs = useMemo(() => {
    if (!clubs || clubs.length === 0) return [];
    return clubs.slice(0, 4);
  }, [clubs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.specialty, filters.institution]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* Header Section */}
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

      {!isLoading && !error && !filters.search && forYouClubs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
              For You
            </h2>
          </div>

          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-5 sm:pb-6 pt-2 px-2 snap-x hide-scrollbar">
            {forYouClubs.map((club) => (
              <Link
                key={`foryou-${club.id}`}
                to={`/clubs/${club.slug}`}
                className="snap-start shrink-0 w-80 group relative bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2rem] p-5 sm:p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="absolute top-4 right-4 flex gap-2"></div>

                <div className="flex flex-col items-center text-center space-y-4 mt-4">
                  <div className="w-20 h-20 rounded-full bg-[var(--bg-active)] p-1 shadow-inner border border-[var(--border-main)] group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-[var(--bg-main)]/80 flex items-center justify-center overflow-hidden text-purple-500 font-black text-xl sm:text-2xl">
                      {club.logo_url ? (
                        <img
                          src={club.logo_url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        club.club_name?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
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
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        {specialtiesList.map((s) => (
          <button
            key={s}
            onClick={() =>
              setFilters({ ...filters, specialty: s === "All" ? "" : s })
            }
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
              activeSpecialty === s
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                : "bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-active)] hover:border-[var(--border-main)] hover:-translate-y-0.5"
            }`}
          >
            {s === "All" ? "All Clubs" : `#${s}`}
          </button>
        ))}
      </div>

      {/* Main Grid */}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <SurfaceCard className="p-10 sm:p-16 lg:p-24 shadow-inner">
              <EmptyState
                icon={Search}
                title={`No Clubs Found${filters.specialty ? ` for "${filters.specialty}"` : filters.search ? ` for "${filters.search}"` : ""}`}
                description={
                  filters.specialty ? (
                    <span className="font-bold">
                      No clubs found for this tag on this page.{" "}
                      <span className="text-purple-600 font-bold">
                        Try checking other pages.
                      </span>
                    </span>
                  ) : (
                    "We couldn't find communities matching your criteria."
                  )
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
              <motion.div
                key={club.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="group h-full"
              >
                <SurfaceCard
                  to={`/clubs/${club.slug}`}
                  as={Link}
                  variant="interactive"
                  className="relative h-full bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2.5rem] p-5 sm:p-6 hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.15)] hover:border-purple-500/45 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-[var(--bg-active)] flex items-center justify-center text-purple-500 font-black text-lg sm:text-xl shrink-0 border border-[var(--border-main)] shadow-sm group-hover:scale-105 transition-transform duration-300">
                      {club.logo_url ? (
                        <img
                          src={club.logo_url}
                          alt=""
                          className="w-full h-full rounded-[1.25rem] object-cover"
                        />
                      ) : (
                        club.club_name?.charAt(0).toUpperCase()
                      )}
                    </div>

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
                    <div className="flex items-center gap-2">
                      <SkillTags
                        skills={club.specialty || "General"}
                        badgeVariant="purple"
                        badgeTone="soft"
                        maxVisible={3}
                        className="text-[5px] font-black uppercase tracking-widest px-2 py-0.5"
                      />
                    </div>
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
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  );
};

export default Clubs;
