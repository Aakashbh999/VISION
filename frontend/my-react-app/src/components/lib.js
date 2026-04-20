/**
 * VISION Component Library
 *
 * Centralized export of all reusable UI components
 * This makes it easy to import components from a single source
 *
 * Usage:
 * import { Button, FormInput, ErrorBoundary } from '@/components/lib'
 *
 * Or for tree-shaking:
 * import { Button } from '@/components/ui/Button'
 */

// UI Components - Layout & Structure
export { default as Card } from "./ui/Card";
export { default as InteractiveCard } from "./ui/InteractiveCard";
export { default as AccessibleFormField } from "./ui/AccessibleFormField";

// UI Components - Input & Forms
export { default as Button } from "./ui/Button";
export { default as FormInput } from "./ui/FormInput";
export { default as FormTextarea } from "./ui/FormTextarea";
export { default as TagInput } from "./ui/TagInput";
export { default as Avatar } from "./ui/Avatar";
export { default as Badge } from "./ui/Badge";

// UI Components - Loading & States
export { default as LoadingState } from "./ui/LoadingState";
export { default as LoadingSpinner } from "./ui/LoadingSpinner";
export { default as SkeletonCard } from "./ui/SkeletonCard";
export { default as SkeletonList } from "./ui/SkeletonList";
export { default as Skeleton } from "./ui/Skeleton";

// UI Components - Feedback
export { default as EmptyState } from "./ui/EmptyState";
export { default as ErrorState } from "./ui/ErrorState";
export { default as Pagination } from "./ui/Pagination";

// UI Components - Search & Navigation
export { default as UniversalSearch } from "./ui/UniversalSearch";
export { default as SearchModal } from "./ui/SearchModal";
export { default as ActionMenu } from "./ui/ActionMenu";

// Specialized Components
export { default as AdminConfirmModal } from "./ui/AdminConfirmModal";
export { default as ButtonLoader } from "./ui/ButtonLoader";
export { default as GradientText } from "./ui/GradientText";
export { default as SkillTags } from "./ui/SkillTags";
export { default as TagSelectorSection } from "./ui/TagSelectorSection";
export { default as AcademicProgramCard } from "./ui/AcademicProgramCard";
export { default as AcademicProgramFilter } from "./ui/AcademicProgramFilter";
export { default as ClubCard } from "./ui/ClubCard";
export { default as ITFieldCard } from "./ui/ITFieldCard";
export { default as JobCard } from "./ui/JobCard";

// Error Handling
export { default as ErrorBoundary } from "./ErrorBoundary";

// Notifications & Toast
export { default as StyledToastContainer } from "./StyledToastContainer";
export {
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  updateToast,
  dismissToast,
} from "../utils/notifications";

// Hooks - Accessibility
export {
  useFocusVisible,
  useKeyboardNavigation,
  useAriaLabel,
  useLiveRegion,
} from "../hooks/useAccessibility";

// Hooks - Focus Management
export {
  useAutoFocus,
  useFocusTrap,
  usePageTitle,
  useSkipLink,
  useAnnounce,
} from "../hooks/useFocusManagement";
