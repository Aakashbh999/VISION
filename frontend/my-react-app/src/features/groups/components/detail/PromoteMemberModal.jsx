import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, ShieldAlert, X, Loader2, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../../../../components/ui/Button";
import Avatar from "../../../../components/ui/Avatar";

const PromoteMemberModal = ({ isOpen, onClose, members = [], user, appointCoAdminMut }) => {
  const [query, setQuery] = useState("");

  const eligibleMembers = (members || []).filter((member) => {
    const isSelf = String(member.user_id) === String(user?.portal_user_id);
    const isAlreadyMod = member.role === "co_admin" || member.role === "owner" || member.role === "admin";
    const matchesSearch = (member.full_name || "").toLowerCase().includes(query.toLowerCase());
    
    return !isSelf && !isAlreadyMod && matchesSearch;
  });

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[var(--bg-card)] rounded-[2.5rem] shadow-2xl border border-[var(--border-main)] overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">Add Moderator</h2>
                <p className="text-sm text-[var(--text-muted)] font-medium">Promote a member to help manage the circle</p>
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
                  placeholder="Search current members..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-[var(--text-muted)]/50"
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 min-h-[300px]">
              {eligibleMembers.length > 0 ? (
                <div className="space-y-2">
                  {eligibleMembers.map((member) => (
                    <div 
                      key={member.user_id}
                      className="flex items-center gap-4 p-4 rounded-3xl hover:bg-[var(--bg-active)] transition-all group"
                    >
                      <Avatar 
                        src={member.profile_image} 
                        name={member.full_name} 
                        size="md"
                        className="border border-[var(--border-main)] shadow-sm"
                        status={member.is_online ? "online" : null}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[var(--text-main)] truncate">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate font-medium uppercase tracking-wider mt-0.5">
                          Regular Member
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            appointCoAdminMut.mutate(member.user_id);
                            onClose();
                        }}
                        disabled={appointCoAdminMut.isPending}
                        className="rounded-xl px-4 h-10 border-dashed border-purple-200 hover:border-purple-500 hover:bg-purple-50 text-purple-600 font-bold"
                      >
                        {appointCoAdminMut.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4 mr-2" /> Promote
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                  <UserCheck className="w-12 h-12 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest text-xs">No eligible members found</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PromoteMemberModal;
