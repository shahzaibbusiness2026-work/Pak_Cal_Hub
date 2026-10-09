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
      className="inline-flex touch-manipulation appearance-none items-center justify-center border-0 bg-transparent p-0 leading-none text-slate-700 shadow-none transition-colors hover:bg-transparent hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 dark:bg-transparent dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-emerald-300"
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
