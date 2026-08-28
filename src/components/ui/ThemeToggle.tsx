'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeMode } from './ThemeRegistry';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
      aria-label="Toggle color theme"
      title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {mode === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-emerald-800 transform transition-transform duration-300" />
      )}
    </button>
  );
}
