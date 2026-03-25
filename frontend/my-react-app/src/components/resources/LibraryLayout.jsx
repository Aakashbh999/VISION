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
            className="fixed top-[120px] z-[100] bg-purple-600 border-2 border-purple-300 p-2 rounded-full hover:bg-purple-700 transition-all hover:scale-105 shadow-lg"
            title="Open Library Sidebar"
            style={{
              left: "max(60px, var(--main-sidebar-width, 60px))",
              boxShadow: "0 2px 12px 0 rgba(80,0,120,0.12)",
            }}
          >
            <ChevronRight size={20} className="text-white" />
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