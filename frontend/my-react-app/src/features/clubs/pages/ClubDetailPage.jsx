import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useClub } from "../../../hooks/useClubHooks";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  MapPin,
  Tag,
  Mail,
  Globe,
  Facebook,
  Linkedin,
  Github,
  MessageCircle,
  Share2,
  Check,
  Calendar,
  Building2,
} from "lucide-react";

const RedditIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 11.5c0-1.654-1.346-3-3-3-.396 0-.77.081-1.114.223-1.644-1.22-3.903-2.007-6.398-2.126l1.353-6.347 4.417.941c.05 1.05.918 1.889 1.989 1.889 1.103 0 2-.897 2-2s-.897-2-2-2c-1.034 0-1.876.79-1.982 1.808l-4.904-1.045c-.171-.036-.347.051-.416.211L13.25 5.567c-2.55.074-4.878.783-6.577 2.016-.328-.135-.688-.203-1.057-.203-1.654 0-3 1.346-3 3 0 .977.472 1.84 1.196 2.38-.035.197-.059.399-.059.604 0 3.321 4.14 6.016 9.25 6.016s9.25-2.695 9.25-6.016c0-.202-.023-.401-.057-.594.743-.541 1.233-1.413 1.233-2.407zm-16.75 3.5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm10.75 0c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm-1.096 4.398c-.689.689-1.785 1.102-2.904 1.102s-2.215-.413-2.904-1.102c-.146-.146-.146-.384 0-.53.147-.147.384-.146.53 0 .546.547 1.458.882 2.374.882s1.828-.335 2.374-.882c.073-.073.169-.11.265-.11s.192.037.265.11c.146.146.146.384 0 .53z" />
  </svg>
);

const ClubDetailPage = () => {
  const { slug } = useParams();
  const { data: club, isLoading, error } = useClub(slug);
  const [copied, setCopied] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-8 text-rose-500 font-bold text-center">
        Failed to load organization
      </div>
    );

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let parsedContact = null;
  if (club?.contact_info) {
    try {
      if (club.contact_info.trim().startsWith("{")) {
        parsedContact = JSON.parse(club.contact_info);
      } else {
        parsedContact = { email: club.contact_info };
      }
    } catch {
      parsedContact = { email: club.contact_info };
    }
  }

  const socialLinks = [
    {
      key: "email",
      icon: Mail,
      label: "Email",
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30",
      url: parsedContact?.email ? `mailto:${parsedContact.email}` : null,
    },
    {
      key: "website",
      icon: Globe,
      label: "Website",
      color: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
      url: club.website_url || parsedContact?.website,
    },
    {
      key: "facebook",
      icon: Facebook,
      label: "Facebook",
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30",
      url: club.facebook_url || parsedContact?.facebook,
    },
    {
      key: "linkedin",
      icon: Linkedin,
      label: "LinkedIn",
      color: "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30",
      url: club.linkedin_url || parsedContact?.linkedin,
    },
    {
      key: "discord",
      icon: MessageCircle,
      label: "Discord",
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30",
      url: club.discord_url || parsedContact?.discord,
    },
    {
      key: "github",
      icon: Github,
      label: "GitHub",
      color: "text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
      url: club.github_url || parsedContact?.github,
    },
    {
      key: "reddit",
      icon: RedditIcon,
      label: "Reddit",
      color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30",
      url: club.reddit_url || parsedContact?.reddit,
    },
  ].filter((link) => link.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="max-w-5xl mx-auto space-y-6 pb-20 px-2 sm:px-6 lg:px-8 mt-6"
    >
      {}
      <div className="flex items-center justify-between">
        <Link
          to="/clubs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-sm font-black text-[var(--text-muted)] hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" /> Discover
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-muted)] rounded-xl text-sm font-black hover:border-purple-200 hover:text-purple-600 transition-all shadow-sm w-32 justify-center"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" /> Copied
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" /> Share
            </>
          )}
        </button>
      </div>

      {}
      <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2.5rem] overflow-hidden shadow-sm">
        {}
        <div className="h-64 sm:h-80 bg-slate-900 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent z-10" />
          {club.banner_url ? (
            <img
              src={club.banner_url}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
          ) : (
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.5),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.5),transparent_50%)]" />
          )}

          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
              <div className="hidden lg:block w-20 h-20 sm:w-32 sm:h-32 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[var(--bg-card)] p-1.5 shadow-2xl relative z-10 sm:-mb-2">
                <div className="w-full h-full rounded-[1rem] sm:rounded-[1.2rem] bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black text-2xl sm:text-3xl lg:text-4xl overflow-hidden border border-purple-100 dark:border-purple-800/50">
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
              <div className="pb-0 sm:pb-2 flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white drop-shadow-md tracking-tight leading-tight break-words">
                  {club.club_name}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-lg sm:text-xl font-black text-[var(--text-main)] mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-500" /> About
            </h2>
            {club.description_full ? (
              <div className="prose prose-slate max-w-none text-[var(--text-muted)] font-medium leading-relaxed whitespace-pre-wrap">
                {club.description_full}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[var(--bg-active)] text-[var(--text-muted)] rounded-[1.5rem] flex items-center justify-center mx-auto mb-3">
                  <span className="font-black text-xl sm:text-2xl">?</span>
                </div>
                <p className="text-[var(--text-muted)] font-medium">
                  We don't have a detailed manifesto for them yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="space-y-6">
          {}
          <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2.5rem] p-6 shadow-sm">
            <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 px-2">
              Key Intel
            </h3>
            <div className="space-y-1">
              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-[var(--bg-active)] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Headquarters
                  </div>
                  <div className="font-bold text-[var(--text-main)] leading-tight mt-0.5 truncate">
                    {club.location || "N/A"}
                  </div>
                  <div className="text-xs font-medium text-[var(--text-muted)] mt-0.5 truncate">
                    {club.institution}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-[var(--bg-active)] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Domain
                  </div>
                  <div className="font-bold text-[var(--text-main)] leading-tight mt-0.5">
                    {club.specialty || "Generalist"}
                  </div>
                </div>
              </div>

              {club.founded_year && (
                <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-[var(--bg-active)] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      Established
                    </div>
                    <div className="font-bold text-[var(--text-main)] leading-tight mt-0.5">
                      {club.founded_year}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          {(socialLinks.length > 0 || parsedContact) && (
            <div className="bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-[2.5rem] p-6 shadow-sm">
              <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 px-2">
                Connections
              </h3>

              <div className="flex flex-wrap gap-2">
                {socialLinks.map(({ key, icon: Icon, color, label, url }) => (
                  <motion.a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-[var(--border-main)] transition-colors shadow-sm ${color}`}
                    title={label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default ClubDetailPage;
