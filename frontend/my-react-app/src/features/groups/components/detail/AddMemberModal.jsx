import { useState, useEffect } from "react";
import { Search, UserPlus, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../../components/ui/Button";
import Avatar from "../../../../components/ui/Avatar";
import api from "../../../../services/api";
import { getUniversalResults, SEARCH_CATEGORIES } from "../../../../services/search";
import { showToast } from "../../../../utils/toast";

const AddMemberModal = ({ isOpen, onClose, groupId, members = [], onMemberAdded }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(null); // ID of user being added

  const isAlreadyMember = (userId) => {
    // Extract numeric ID from "user-123" format if necessary
    const targetId = typeof userId === "string" && userId.startsWith("user-") 
      ? userId.split("-")[1] 
      : userId;
    
    return (members || []).some(m => String(m.user_id) === String(targetId));
  };

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { results: searchResults } = await getUniversalResults(query);
        // Filter only users
        const users = searchResults.filter(r => r.category === SEARCH_CATEGORIES.USERS);
        setResults(users);
      } catch (error) {
        console.error("User search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddMember = async (targetUser) => {
    setIsAdding(targetUser.id);
    try {
      const userId = typeof targetUser.id === "string" && targetUser.id.startsWith("user-") 
        ? targetUser.id.split("-")[1] 
        : targetUser.id;

      await api.post(`/groups/${groupId}/invitations`, { userId });
      
      showToast.success(`Invitation sent to ${targetUser.title}`);
      
      if (onMemberAdded) onMemberAdded();
    } catch (error) {
      showToast.error(error.response?.data?.error || "Failed to send invitation");
    } finally {
      setIsAdding(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Invite Member</h2>
            <p className="text-sm text-[var(--text-muted)] font-medium">Send an invitation to join this circle</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-2xl bg-[var(--bg-active)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-8 py-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name, student ID, or campus..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-[var(--text-muted)]/50"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Scanning network...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((user) => {
                const added = isAlreadyMember(user.id);
                return (
                  <div 
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-3xl hover:bg-[var(--bg-active)] transition-all group"
                  >
                    <Avatar 
                      src={user.profilePicture} 
                      name={user.title} 
                      size="md"
                      className="border border-[var(--border-main)] shadow-sm"
                      status={user.is_online ? "online" : null}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[var(--text-main)] truncate flex items-center gap-2">
                        {user.title}
                        {user.is_online && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate font-medium uppercase tracking-wider mt-0.5">
                        {user.description || "Student"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant={added ? "secondary" : isAdding === user.id ? "ghost" : "primary"}
                      onClick={() => !added && handleAddMember(user)}
                      disabled={isAdding !== null || added}
                      className="rounded-xl px-4 h-10 shadow-md shadow-purple-500/10"
                    >
                      {isAdding === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : added ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Added
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" /> Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
              <Search className="w-12 h-12 mb-4" />
              <p className="text-sm font-bold italic">No students found matching "{query}"</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
              <CheckCircle2 className="w-12 h-12 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-xs">Awaiting Input</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AddMemberModal;
