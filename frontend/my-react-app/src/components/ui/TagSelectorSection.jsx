import React from "react";
import { Plus, Tag, X } from "lucide-react";

const TagSelectorSection = ({
  customTags,
  systemTags,
  customTagInput,
  setCustomTagInput,
  customTagCap,
  systemTagCap,
  systemTagOptions,
  isLoadingTags,
  customTagPlaceholder,
  onAddCustomTag,
  onRemoveCustomTag,
  onToggleSystemTag,
  onCustomTagKeyDown,
  showCustomTags = true,
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
        {showCustomTags && (
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-[var(--text-main)]">
              Custom tags (optional)
            </p>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                customTags.length >= customTagCap
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {customTags.length}/{customTagCap} added
            </span>
          </div>
        )}

        {showCustomTags && customTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveCustomTag(tag)}
                  className="hover:text-indigo-900 ml-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {showCustomTags && customTags.length < customTagCap && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={onCustomTagKeyDown}
              placeholder={customTagPlaceholder}
              maxLength={50}
              className="flex-1 px-4 py-2 border border-[var(--border-main)] rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all bg-transparent text-[var(--text-main)] text-sm"
            />
            <button
              type="button"
              onClick={onAddCustomTag}
              disabled={!customTagInput.trim()}
              className="px-3 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

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
