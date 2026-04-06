import React from "react";
import { useFilters } from "../../context/LibraryFilterContext";
import { BookOpen, User, GraduationCap, ChevronLeft } from "lucide-react";

const LibrarySidebar = ({ isCollapsed, onToggle }) => {
  const { filters, updateFilter } = useFilters();
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const sidebarItems = [
    {
      id: "all",
      label: "All Resources",
      icon: BookOpen,
      action: () => updateFilter("view", "all"),
    },
    {
      id: "my",
      label: "My Resources",
      icon: User,
      action: () => updateFilter("view", "my"),
    },
  ];

  return (
    <aside
      className={`relative h-full bg-[var(--bg-card)] border-r border-[var(--border-main)] flex flex-col shadow-sm
      transition-all duration-300 ease-in-out z-20 overflow-visible
      ${isCollapsed ? "w-0 opacity-0 border-none" : "w-64 opacity-100"}`}
    >
      <div className="w-64 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-[var(--border-main)] relative">
          <h2 className="font-bold text-[var(--text-main)]">Library</h2>
          <button
            onClick={onToggle}
            className="absolute top-1/2 -right-3 -translate-y-1/2 w-7 h-7 rounded-full bg-[var(--bg-card)] border border-[var(--border-main)] shadow-md hover:bg-[var(--bg-active)] hover:border-purple-300 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all z-40 flex items-center justify-center"
            title="Minimize Library Sidebar"
            aria-label="Minimize Library Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                filters.view === item.id
                  ? "bg-purple-50 text-purple-700 font-bold shadow-sm shadow-purple-500/5"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
              }`}
            >
              <item.icon
                size={20}
                className={
                  filters.view === item.id
                    ? "text-purple-600"
                    : "text-[var(--text-muted)]"
                }
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}

          {/* Semester Section */}
          <div className="pt-4 pb-2">
            <div className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">
              Semesters
            </div>
            <div className="space-y-0.5">
              {semesters.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    updateFilter("semester", s === filters.semester ? "" : s)
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm ${
                    filters.semester === s
                      ? "bg-purple-100 text-purple-700 font-black"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
                  }`}
                >
                  <GraduationCap
                    size={18}
                    className={
                      filters.semester === s
                        ? "text-purple-600"
                        : "text-[var(--text-muted)]"
                    }
                  />
                  <span className="whitespace-nowrap">Semester {s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LibrarySidebar;
