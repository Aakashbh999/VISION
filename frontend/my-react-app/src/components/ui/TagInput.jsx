import { useState, useRef } from "react";
import { X, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

/**
 * TagInput — A premium pill-style hashtag input component.
 *
 * Props:
 *   tags        {string[]} - Controlled list of current tags
 *   onChange    {(tags: string[]) => void} - Called when tags change
 *   placeholder {string} - Input placeholder text
 *   className   {string} - Extra classes for the outer wrapper
 */
const TagInput = ({
  tags = [],
  onChange,
  placeholder = 'Add tags (e.g., #javascript, #career_tips)...',
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const normalizeTag = (raw) =>
    raw
      .toLowerCase()
      .replace(/^#+/, "")         // strip leading #
      .replace(/[^a-z0-9_]/g, "") // keep only safe chars
      .slice(0, MAX_TAG_LENGTH);

  const addTag = (raw) => {
    const tag = normalizeTag(raw);
    if (!tag) return;
    if (tags.includes(tag)) return; // no duplicates
    if (tags.length >= MAX_TAGS) return; // cap at 10
    onChange([...tags, tag]);
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (["Enter", ",", "Tab"].includes(e.key)) {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue.trim());
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" />
          Tags
        </label>
        <span className={`text-[10px] font-bold ${tags.length >= MAX_TAGS ? "text-red-500" : "text-gray-400"}`}>
          {tags.length} / {MAX_TAGS}
        </span>
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className={`
          relative flex flex-wrap gap-2 min-h-[52px] w-full px-3 py-2.5
          border rounded-xl bg-slate-50 cursor-text transition-all duration-200
          ${isFocused
            ? "border-purple-500 ring-4 ring-purple-500/10 bg-white"
            : "border-slate-200 hover:border-slate-300"
          }
        `}
      >
        <AnimatePresence>
          {tags.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="inline-flex items-center gap-1 py-1 px-2.5 bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-black rounded-lg tracking-tight select-none"
            >
              <span className="text-purple-400">#</span>
              {tag}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                className="ml-0.5 text-purple-400 hover:text-purple-700 transition-colors rounded-full hover:bg-purple-200 p-0.5"
                aria-label={`Remove #${tag}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : tags.length < MAX_TAGS ? "Add another tag..." : ""}
          disabled={tags.length >= MAX_TAGS}
          className="flex-1 min-w-[180px] bg-transparent outline-none text-sm font-medium text-gray-700 placeholder:text-gray-300 placeholder:font-normal disabled:cursor-not-allowed"
        />
      </div>

      <p className="text-[10px] text-gray-400 font-medium">
        Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-black">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-black">,</kbd> to add a tag. Backspace removes the last one.
      </p>
    </div>
  );
};

export default TagInput;
