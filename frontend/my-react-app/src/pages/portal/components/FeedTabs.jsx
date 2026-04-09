import React from "react";
import { Sparkles, MessageSquare, Users, BookOpen } from "lucide-react";

const tabs = [
  { id: "for-you", label: "For You", icon: <Sparkles className="w-4 h-4" /> },
  { id: "discussions", label: "Discussions", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "groups", label: "Groups", icon: <Users className="w-4 h-4" /> },
  { id: "resources", label: "Resources", icon: <BookOpen className="w-4 h-4" /> },
];

const FeedTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl w-full sm:w-fit">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 flex-1 sm:flex-initial
              ${isActive 
                ? "bg-[var(--bg-card)] text-purple-600 shadow-sm border border-[var(--border-main)]" 
                : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50"
              }
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {isActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border-2 border-[var(--bg-card)]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FeedTabs;
