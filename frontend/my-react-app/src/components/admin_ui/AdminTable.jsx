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
  emptyMessage = "No records found.",
  actionsHeader = "Actions",
  searchPlaceholder = "Search records..."
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
        <p className="font-medium">Error loading data</p>
        <p className="text-sm opacity-80 mt-1">{error?.message || "Please try again later."}</p>
      </div>
    );
  }

  // Local filtering logic
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    const searchStr = searchTerm.toLowerCase();
    
    // Search across all values in the row
    return Object.values(row).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(searchStr)
    );
  });

  return (
    <div className="space-y-4">
      {/* Local Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border-main rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
        />
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
            {filteredData.map((row, rowIndex) => (
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
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (onView || onEdit || onDelete ? 1 : 0)} className="px-6 py-12 text-center text-text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};

export default AdminTable;
