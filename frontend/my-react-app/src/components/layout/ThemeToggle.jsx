import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full hover:bg-[var(--bg-active)] transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
