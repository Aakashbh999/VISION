/**
 * SimplePagination — lightweight Prev / Next paginator.
 * Use this when you only need previous/next navigation without numbered page buttons.
 * For numbered-page pagination use the existing `Pagination.jsx`.
 */
const SimplePagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-3 mt-6">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-4 py-2 border border-[var(--border-main)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-active)] transition-colors text-[var(--text-main)]"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-sm text-[var(--text-muted)] font-medium">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 border border-[var(--border-main)] rounded-lg disabled:opacity-50 hover:bg-[var(--bg-active)] transition-colors text-[var(--text-main)]"
      >
        Next
      </button>
    </div>
  );
};

export default SimplePagination;
