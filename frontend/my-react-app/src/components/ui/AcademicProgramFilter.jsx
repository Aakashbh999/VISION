import React from "react";

const AcademicProgramFilter = ({ value, onChange, options, name, placeholder = "All IT Programs", disabled = false, className = "" }) => {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`text-xs sm:text-sm font-bold text-[var(--text-main)] bg-[var(--bg-card)] cursor-pointer border border-[var(--border-main)] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all disabled:opacity-60 disabled:cursor-wait appearance-none shadow-sm ${className}`}
    >
      <option value="" className="bg-[var(--bg-card)] text-[var(--text-main)] font-semibold">
        {placeholder}
      </option>
      {options?.map((opt) => (
        <option
          key={opt.id || opt.program_id}
          value={opt.id || opt.program_id}
          className="bg-[var(--bg-card)] text-[var(--text-main)]"
        >
          {opt.name || opt.program_name || opt.code}
        </option>
      ))}
    </select>
  );
};

export default AcademicProgramFilter;
