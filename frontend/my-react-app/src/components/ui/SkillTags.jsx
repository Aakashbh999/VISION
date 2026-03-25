import { useState } from "react";

const SkillTags = ({ skillsString }) => {
  const [showAll, setShowAll] = useState(false);

  if (!skillsString) return null;

  let skills = [];
  try {
    skills = JSON.parse(skillsString);
  } catch {
    skills = skillsString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
  }

  if (skills.length === 0) return null;

  const visibleSkills = showAll ? skills : skills.slice(0, 3);
  const hiddenCount = skills.length - 3;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {visibleSkills.map((skill, idx) => (
        <span
          key={idx}
          className="text-xs bg-[var(--bg-active)] px-2 py-1 rounded-full text-[var(--text-main)]"
        >
          {skill}
        </span>
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