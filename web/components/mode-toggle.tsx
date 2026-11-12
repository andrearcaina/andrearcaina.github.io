"use client";

import * as React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "next-themes";

export function ModeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const toggle = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <div className="relative isolate">
      <button
        type="button"
        className={`${className} site-theme-toggle`}
        aria-label="Toggle theme"
        onClick={toggle}
      >
        <div className="relative flex h-4 w-4 items-center justify-center">
          <FiSun className="absolute h-3.5 w-3.5 dark:opacity-0 opacity-100" />
          <FiMoon className="absolute h-3.5 w-3.5 dark:opacity-100 opacity-0" />
        </div>
      </button>
    </div>
  );
}
