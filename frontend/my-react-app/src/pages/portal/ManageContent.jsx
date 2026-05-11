import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, MessageSquare, Users } from "lucide-react";
import SurfaceCard from "../../components/ui/SurfaceCard";
import PageHeader from "../../components/ui/PageHeader";
import SegmentedControl from "../../components/ui/SegmentedControl";
import ResourcesPanel from "./manage/ResourcesPanel";
import DiscussionsPanel from "./manage/DiscussionsPanel";
import SocialPanel from "./manage/SocialPanel";

const TABS = [
  { value: "resources", label: "My Resources", icon: BookOpen },
  { value: "discussions", label: "My Discussions", icon: MessageSquare },
  { value: "social", label: "Social", icon: Users },
];

const ManageContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "resources";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    setSearchParams({ tab: tabValue });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <PageHeader
        title="Manage Content"
        subtitle="Keep track of all the resources, discussions, and social connections you've created across VISION."
      />

      {}
      <div className="bg-[var(--bg-card)] p-2 rounded-2xl shadow-sm border border-[var(--border-main)] flex gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-active)] hover:text-[var(--text-main)]"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {}
      <SurfaceCard className="overflow-hidden">
        {activeTab === "resources" && <ResourcesPanel />}
        {activeTab === "discussions" && <DiscussionsPanel />}
        {activeTab === "social" && <SocialPanel />}
      </SurfaceCard>
    </div>
  );
};

export default ManageContent;
