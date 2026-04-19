import { MessageSquare } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";

/**
 * DiscussionsPanel — placeholder panel inside ManageContent.
 * Redirects users to the dedicated My Posts page.
 */
const DiscussionsPanel = () => (
  <div className="p-4 sm:p-6 md:p-8 text-center py-16 sm:py-20">
    <EmptyState
      icon={MessageSquare}
      title="My Discussions"
      description="Manage your discussion threads here."
      actionText="Go to My Posts"
      actionHref="/discussions/my-posts"
    />
  </div>
);

export default DiscussionsPanel;
