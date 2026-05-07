import React, { useState } from "react";
import { Edit, Trash2, Search } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

const AdminTable = ({ 
  columns, 
  data = [], 
  isLoading, 
  error, 
  onView,
  onEdit, 
  onDelete,
  onSearchChange,
  value,
  emptyMessage = "No records found.",
  actionsHeader = "Actions",
  searchPlaceholder = "Search records..."
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");

  // Use external value if provided, otherwise use internal state
  const searchTerm = value !== undefined ? value : internalSearchTerm;

  const handleSearch = (e) => {
    const newVal = e.target.value;
    if (value === undefined) {
      setInternalSearchTerm(newVal);
    }
    if (onSearchChange) {
      onSearchChange(newVal);
    }
  };

  const renderContent = () => {
    if (isLoading && data.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="px-6 py-12">
            <LoadingSpinner />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="px-6 py-8 text-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm opacity-80 mt-1">{error?.message || "Please try again later."}</p>
          </td>
        </tr>
      );
    }

    // Local filtering logic (only if onSearchChange is not provided)
    const filteredData = onSearchChange 
      ? data 
      : data.filter(row => {
          if (!searchTerm) return true;
          const searchStr = searchTerm.toLowerCase();
          return Object.values(row).some(val => 
            val !== null && val !== undefined && String(val).toLowerCase().includes(searchStr)
          );
        });

    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-text-muted font-medium">
            {emptyMessage}
          </td>
        </tr>
      );
    }

    return filteredData.map((row, rowIndex) => (
      <tr key={row.id || row.tag_id || row.program_id || rowIndex} className="hover:bg-bg-active/30 transition-colors">
        {columns.map((col, colIndex) => (
          <td key={colIndex} className="px-6 py-4 text-sm text-text-main">
            {col.render ? col.render(row) : (
              typeof row[col.accessor] === 'object' && row[col.accessor] !== null
                ? JSON.stringify(row[col.accessor])
                : String(row[col.accessor] ?? "")
            )}
          </td>
        ))}
        {(onView || onEdit || onDelete) && (
          <td className="px-6 py-4 text-right whitespace-nowrap">
            <div className="flex justify-end gap-2">
              {onView && (
                <button
                  onClick={() => onView(row)}
                  className="p-2 text-text-muted hover:text-green-600 hover:bg-green-500/10 rounded-xl transition-all"
                  title="View Details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(row)}
                  className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(row)}
                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
    ));
  };

  return (
    <div className="space-y-4">
      {/* Search Bar - Always stays mounted */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-main rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
        />
        {isLoading && data.length > 0 && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2">
             <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
           </div>
        )}
      </div>

      <div className="bg-bg-card rounded-2xl border border-border-main overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-main text-left">
            <thead className="bg-bg-active/50">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
                {(onView || onEdit || onDelete) && (
                  <th className="px-6 py-4 text-right text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
                    {actionsHeader}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {renderContent()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTable;
