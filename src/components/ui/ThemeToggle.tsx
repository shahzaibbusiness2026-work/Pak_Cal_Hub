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
      className="btn-icon"
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
