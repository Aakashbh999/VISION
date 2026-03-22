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
      className={`relative h-full bg-white border-r border-gray-100 flex flex-col shadow-sm
      transition-all duration-300 ease-in-out z-20 overflow-hidden
      ${isCollapsed ? "w-0 opacity-0 border-none" : "w-64 opacity-100"}`}
    >
      {/* We wrap everything in a fixed-width div so the text doesn't 
         wrap weirdly while the sidebar is sliding shut 
      */}
      <div className="w-64 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Library</h2>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
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
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon
                size={20}
                className={
                  filters.view === item.id ? "text-blue-600" : "text-gray-400"
                }
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}

          {/* Semester Section */}
          <div className="pt-4 pb-2">
            <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
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
                      ? "bg-slate-100 text-blue-700 font-bold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <GraduationCap
                    size={18}
                    className={
                      filters.semester === s ? "text-blue-600" : "text-gray-400"
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
