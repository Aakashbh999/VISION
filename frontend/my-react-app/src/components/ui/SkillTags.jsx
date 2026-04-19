import { useState } from "react";
import Badge from "./Badge";

/**
 * SkillTags - A reusable tag list for skills or similar items.
 * @param {object} props
 * @param {string[]|string} props.skills - Array or comma-separated string of skills/tags.
 * @param {number} [props.maxVisible=4] - Number of tags to show before "+more" button.
 * @param {string} [props.className] - Optional className for the wrapper div.
 * @param {string} [props.badgeVariant] - Badge color variant (e.g., "green", "purple").
 * @param {string} [props.badgeTone] - Badge tone ("soft", "solid", "outline").
 */
const SkillTags = ({
  skills,
  maxVisible = 4,
  className = "",
  badgeVariant = "purple",
  badgeTone = "soft",
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!skills) return null;

  let skillArr = [];
  if (Array.isArray(skills)) {
    skillArr = skills.filter(Boolean);
  } else if (typeof skills === "string") {
    try {
      skillArr = JSON.parse(skills);
      if (!Array.isArray(skillArr)) {
        skillArr = [];
      }
    } catch {
      skillArr = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
    }
  }

  if (skillArr.length === 0) return null;

  const visibleSkills = showAll ? skillArr : skillArr.slice(0, maxVisible);
  const hiddenCount = skillArr.length - maxVisible;

  return (
    <div className={`flex flex-wrap items-center gap-1 mt-2 ${className}`}>
      {visibleSkills.map((skill, idx) => (
        <Badge key={idx} variant={badgeVariant} tone={badgeTone} size="sm">
          {skill}
        </Badge>
      ))}
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs bg-[var(--bg-active)] px-2 py-1 rounded-full text-[var(--text-muted)] hover:bg-[var(--border-main)] transition-colors"
        >
          +{hiddenCount} more
        </button>
      )}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs bg-[var(--bg-active)] px-2 py-1 rounded-full text-[var(--text-muted)] hover:bg-[var(--border-main)] transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
};

export default SkillTags;
