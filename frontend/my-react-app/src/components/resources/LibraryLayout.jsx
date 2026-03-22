import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import LibrarySidebar from "./LibrarySidebar";

const LibraryLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex w-full relative min-h-[calc(100vh-80px)]">
      {/* Library Sidebar Wrapper (Sticky) */}
      <div className="sticky top-[80px] h-[calc(100vh-80px)] shrink-0 z-20 hidden md:block">
        <LibrarySidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
        
        {/* Reopen button when sidebar is collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute left-6 top-4 z-30 bg-white shadow-xl border border-gray-200 p-3 rounded-full hover:bg-gray-50 transition-all hover:scale-105 cursor-pointer flex items-center justify-center text-purple-600"
            title="Open Library Sidebar"
          >
            <ChevronRight size={20} className="ml-0.5" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-20">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LibraryLayout;
