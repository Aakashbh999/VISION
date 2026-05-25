import React from "react";
import { Plus, Tag, X } from "lucide-react";

const TagSelectorSection = ({
  systemTags,
  systemTagCap,
  systemTagOptions,
  isLoadingTags,
  onToggleSystemTag,
  label = "Tags",
  showSystemLabel = true,
  getSystemTagId = (tag) => tag.tag_id,
  getSystemTagLabel = (tag) => tag.name,
}) => {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Tag className="w-3.5 h-3.5 text-purple-500" />
        <label className="text-sm font-medium text-[var(--text-main)]">
          {label}
        </label>
      </div>

      <div className="space-y-3">


        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            {showSystemLabel ? (
              <p className="text-xs font-medium text-[var(--text-main)]">
                System tags
              </p>
            ) : (
              <div />
            )}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                systemTags.length >= systemTagCap
                  ? "bg-purple-100 text-purple-700"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {systemTags.length}/{systemTagCap} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {isLoadingTags && (
              <p className="text-xs text-[var(--text-muted)] italic">
                Loading tags...
              </p>
            )}
            {systemTagOptions.map((tag) => {
              const tagId = getSystemTagId(tag);
              const isSelected = systemTags.includes(tagId);
              const isDisabled =
                !isSelected && systemTags.length >= systemTagCap;
              return (
                <button
                  key={tagId}
                  type="button"
                  onClick={() => onToggleSystemTag(tagId)}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : isDisabled
                        ? "bg-[var(--bg-active)] text-[var(--text-muted)] border-[var(--border-main)] opacity-40 cursor-not-allowed"
                        : "bg-transparent text-[var(--text-main)] border-[var(--border-main)] hover:border-purple-400 hover:text-purple-600 cursor-pointer"
                  }`}
                >
                  {getSystemTagLabel(tag)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagSelectorSection;
