import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-[var(--border-main)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-active)] transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5 text-[var(--text-main)]" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-lg transition-colors ${
            page === currentPage
              ? "bg-purple-600 text-white"
              : "border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-active)]"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-[var(--border-main)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-active)] transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5 text-[var(--text-main)]" />
      </button>
    </div>
  );
};

export default Pagination;