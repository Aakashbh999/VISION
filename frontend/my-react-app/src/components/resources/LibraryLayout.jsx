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
            className="absolute top-1/2 -translate-y-1/2 -right-4 z-[100] w-10 h-10 rounded-full bg-purple-700 border-2 border-white/90 text-white hover:bg-purple-800 hover:border-white transition-all hover:scale-110 shadow-2xl ring-2 ring-purple-300/70 focus:outline-none focus:ring-4 focus:ring-purple-400/80 flex items-center justify-center"
            title="Open Library Sidebar"
            aria-label="Open Library Sidebar"
            style={{
              boxShadow: "0 8px 24px rgba(76, 29, 149, 0.42)",
            }}
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 pb-20">
        <div className="max-w-[1400px] mx-auto px-0 py-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default LibraryLayout;
