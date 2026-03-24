/**
 * components/TagInput.jsx
 * ─────────────────────────────────────────────
 * Reusable pill/tag input. Press Enter or comma to add a tag.
 * Used for: skills_required, certifications_in_skills, perks
 *
 * Props:
 *   tags       – string[]   controlled value
 *   onChange   – (string[]) => void
 *   placeholder – string
 *   color      – "green" | "blue" | "orange"  (default "green")
 */

import { useState, useRef } from "react";

const COLOR = {
  green:  { wrap: "focus-within:border-brand-green",  tag: "bg-green-50 text-green-700 border border-green-200"  },
  blue:   { wrap: "focus-within:border-navy-500",      tag: "bg-blue-50 text-navy-700 border border-blue-200"     },
  orange: { wrap: "focus-within:border-orange-400",    tag: "bg-orange-50 text-orange-700 border border-orange-200" },
};

export default function TagInput({ tags = [], onChange, placeholder = "Type and press Enter", color = "green" }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const c = COLOR[color] || COLOR.green;

  const add = (raw) => {
    const val = raw.trim().replace(/,$/, "");
    if (!val || tags.includes(val)) return;
    onChange([...tags, val]);
    setInput("");
  };

  const remove = (val) => onChange(tags.filter(t => t !== val));

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };

  return (
    <div
      className={`flex flex-wrap gap-1.5 min-h-[42px] px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-text transition-colors ${c.wrap}`}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map(tag => (
        <span key={tag} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${c.tag}`}>
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); remove(tag); }}
            className="ml-0.5 opacity-60 hover:opacity-100 leading-none font-bold text-sm"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => input && add(input)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400"
      />
    </div>
  );
}