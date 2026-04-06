import { useState, useEffect, useMemo } from "react";
import { useClubs } from "../../hooks/useClubHooks";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UniversalSearch from "../../components/ui/UniversalSearch";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Tag,
  Building2,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

const specialtiesList = [
  "All",
  "Web",
  "AI",
  "Cyber",
  "Cloud",
  "Data",
  "Robotics",
  "Open Source",
  "General",
];

const Clubs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  const { data: clubs, isLoading, error } = useClubs(filters);

  const activeSpecialty = filters.specialty || "All";

  const forYouClubs = useMemo(() => {
    if (!clubs || clubs.length === 0) return [];
    return clubs.slice(0, 4);
  }, [clubs]);

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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-0 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header Section */}
      <div className="relative bg-[var(--bg-card)]/40 backdrop-blur-xl border border-[var(--border-main)]/40 rounded-[2.5rem] p-8 shadow-2xl shadow-purple-500/5 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-3"
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
      </div>

      {!isLoading && !error && !filters.search && forYouClubs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)]">
              For You
            </h2>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2 snap-x hide-scrollbar">
            {forYouClubs.map((club) => (
              <Link
                key={`foryou-${club.id}`}
                to={`/clubs/${club.slug}`}
                className="snap-start shrink-0 w-80 group relative bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300"
              >
                <div className="absolute top-4 right-4 flex gap-2"></div>

                <div className="flex flex-col items-center text-center space-y-4 mt-4">
                  <div className="w-20 h-20 rounded-full bg-[var(--bg-active)] p-1 shadow-inner border border-[var(--border-main)] group-hover:scale-105 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-[var(--bg-card)] flex items-center justify-center overflow-hidden text-purple-600 font-black text-xl sm:text-2xl">
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
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner />
            <p className="text-[var(--text-muted)] font-bold mt-4 uppercase tracking-widest text-xs">
              Finding Communities...
            </p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-12 rounded-[2.5rem] text-center font-bold">
            Failed to load clubs. Please try again.
          </div>
        ) : clubs?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border-main)]/50 rounded-[3rem] p-24 text-center shadow-inner"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-purple-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm rotate-12">
                <Search className="w-10 h-10 text-purple-400 -rotate-12" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mb-2">
                  No clubs found for "{filters.search}"
                </h3>
                <p className="text-[var(--text-muted)] font-medium">
                  We couldn't track down any communities matching your criteria.
                  Want to start a movement?
                </p>
              </div>
              <button
                onClick={() =>
                  window.open(
                    "mailto:admin@vision.edu.np?subject=New Club Request",
                    "_blank",
                  )
                }
                className="mt-4 px-8 py-3.5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 hover:-translate-y-1"
              >
                Register a New Club
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {clubs?.map((club) => (
              <motion.div
                key={club.id}
                variants={itemVariants}
                className="group h-full"
              >
                <Link
                  to={`/clubs/${club.slug}`}
                  className="relative block h-full bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2.5rem] p-6 hover:shadow-[0_20px_40px_-15px_rgba(124,58,237,0.15)] hover:border-purple-300 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-[var(--bg-active)] border border-[var(--border-main)] text-[var(--text-muted)] rounded-full">
                      <Building2 className="w-3 h-3" /> Directory
                    </span>
                  </div>

                  <div className="flex items-start gap-4 pr-16">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-purple-50 flex items-center justify-center text-purple-600 font-black text-lg sm:text-xl shrink-0 border border-purple-100 shadow-sm group-hover:scale-105 transition-transform duration-300">
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

                  <div className="mt-6 flex text-sm text-[var(--text-muted)] font-medium line-clamp-2 leading-relaxed flex-1">
                    {club.description_full
                      ? club.description_full.substring(0, 100) + "..."
                      : "A technology community focusing on innovation and collaboration."}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-[var(--border-main)]/80">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 text-purple-600 bg-purple-50 rounded-lg">
                        <Tag className="w-3 h-3" />{" "}
                        {club.specialty || "General"}
                      </span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[var(--bg-active)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

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
