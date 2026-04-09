import { motion } from "framer-motion";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Edit,
  AlertTriangle,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import ActionMenu from "../../../../components/ui/ActionMenu";
import DeleteAction from "../../../../components/DeleteAction";
import ButtonLoader from "../../../../components/ui/ButtonLoader";

const DiscussionPostCard = ({
  discussion,
  comments,
  user,
  id,
  navigate,
  isImageLoading,
  setIsImageLoading,
  setLightbox,
  voteMutation,
  toggleSaveMutation,
  onVote,
  onOpenReport,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row bg-[var(--bg-card)] border border-[var(--border-main)] border-x-0 sm:border-x rounded-xl overflow-hidden shadow-sm"
    >
      <div className="w-full md:w-14 bg-[var(--bg-active)]/30 flex flex-row md:flex-col items-center justify-center p-2 md:py-6 gap-2 border-b md:border-b-0 md:border-r border-[var(--border-main)]">
        <button
          onClick={() => onVote(1)}
          disabled={voteMutation.isPending}
          className={`p-1 rounded-lg transition-all ${discussion.user_vote === 1 ? "text-purple-600 bg-purple-50" : "text-[var(--text-muted)] hover:bg-[var(--bg-active)]"}`}
        >
          {voteMutation.isPending ? (
            <ButtonLoader size={24} />
          ) : (
            <ArrowBigUp
              className={`w-8 h-8 ${discussion.user_vote === 1 ? "fill-purple-600" : ""}`}
            />
          )}
        </button>
        <span
          className={`text-base font-black px-3 py-1 rounded-lg shadow-sm border ${
            discussion.user_vote === 1
              ? "text-purple-600 bg-purple-50 border-purple-200"
              : discussion.user_vote === -1
                ? "text-red-600 bg-red-50 border-red-200"
                : "text-[var(--text-main)] bg-[var(--bg-active)] border-[var(--border-main)]"
          }`}
          title="Net Likes"
        >
          {discussion.like_count || 0}
        </span>
        <button
          onClick={() => onVote(-1)}
          disabled={voteMutation.isPending}
          className={`p-1 rounded-lg transition-all ${discussion.user_vote === -1 ? "text-red-600 bg-red-50" : "text-[var(--text-muted)] hover:bg-[var(--bg-active)]"}`}
        >
          {voteMutation.isPending ? (
            <ButtonLoader size={24} />
          ) : (
            <ArrowBigDown
              className={`w-8 h-8 ${discussion.user_vote === -1 ? "fill-red-600" : ""}`}
            />
          )}
        </button>
      </div>

      <div className="flex-1 p-2 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black tracking-widest text-[var(--text-muted)]">
            <span className="text-purple-500 font-black cursor-pointer truncate max-w-[120px] sm:max-w-none">
              {(discussion.specialization_name || "general")
                .toLowerCase()
                .replace(/\s+/g, "")}
            </span>
            <span className="opacity-50">•</span>
            <span className="text-[var(--text-main)]/80 truncate max-w-[100px] sm:max-w-none">
              {discussion.author?.toLowerCase().replace(/\s+/g, "")}
            </span>
            <span className="opacity-50">•</span>
            <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-between items-start mb-6">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[var(--text-main)] tracking-tight">
            {discussion.title}
          </h1>
          <ActionMenu
            actions={[
              {
                label: "Share",
                icon: <Share2 className="w-4 h-4" />,
                onClick: () => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied!");
                },
              },
              ...(String(discussion.user_id) ===
              String(user?.portal_user_id || user?.user_id)
                ? [
                    {
                      label: "Manage Post",
                      icon: <Edit className="w-4 h-4" />,
                      onClick: () => navigate(`/portal/discussions/${id}/edit`),
                    },
                    {
                      render: () => (
                        <DeleteAction
                          targetType="discussion"
                          targetId={id}
                          label="Delete Post"
                          iconClassName="w-4 h-4"
                          buttonClassName="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors duration-150"
                          onDeleted={() => navigate("/discussions")}
                        />
                      ),
                    },
                  ]
                : [
                    {
                      label: "Report",
                      icon: <AlertTriangle className="w-4 h-4" />,
                      onClick: () => onOpenReport(id, "discussion"),
                      variant: "danger",
                    },
                  ]),
            ]}
          />
        </div>

        {discussion.image_url && (
          <div
            className="relative mb-8 rounded-2xl overflow-hidden border border-[var(--border-main)] group cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
            onClick={() =>
              setLightbox({
                isOpen: true,
                image: discussion.image_url,
                title: discussion.title,
              })
            }
          >
            {isImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-active)] animate-pulse">
                <ImageIcon className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
            )}
            <img
              src={discussion.image_url}
              alt={discussion.title}
              onLoad={() => setIsImageLoading(false)}
              className={`w-full max-h-[500px] object-cover transition-all duration-500 group-hover:scale-[1.02] ${isImageLoading ? "opacity-0" : "opacity-100"}`}
            />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md p-2 rounded-xl text-white">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        )}

        <div className="prose prose-purple max-w-none text-[var(--text-main)] mb-10 whitespace-pre-wrap">
          {discussion.content}
        </div>

        <div className="flex items-center gap-2 border-t border-[var(--border-main)] pt-6">
          <button className="flex items-center gap-2 text-xs font-black text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border-main)] px-4 py-2 rounded-full">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            {comments?.length || 0} Comments
          </button>
          <button
            onClick={() => toggleSaveMutation.mutate()}
            disabled={toggleSaveMutation.isPending}
            className={`p-2.5 rounded-full transition-all ${discussion.user_saved ? "text-amber-500 bg-amber-50" : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] border border-[var(--border-main)]"}`}
          >
            {toggleSaveMutation.isPending ? (
              <ButtonLoader size={16} />
            ) : (
              <Bookmark
                className={`w-4 h-4 ${discussion.user_saved ? "fill-amber-500" : ""}`}
              />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscussionPostCard;
