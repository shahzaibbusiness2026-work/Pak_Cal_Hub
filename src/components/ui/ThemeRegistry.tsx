'use client';

import * as React from 'react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeMode = () => React.useContext(ThemeContext);

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = React.useState(false);

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('pak-calc-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setMode(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setMode('dark');
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('pak-calc-theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  // MUI Theme based on active mode
  const currentTheme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'dark' ? '#22c55e' : '#01411c',
          light: '#4ade80',
          dark: '#002b11',
          contrastText: '#ffffff',
        },
        secondary: {
          main: mode === 'dark' ? '#38bdf8' : '#0284c7',
        },
        background: {
          default: mode === 'dark' ? '#020617' : '#f8fafc',
          paper: mode === 'dark' ? '#0f172a' : '#ffffff',
        },
      },
      typography: {
        fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
        button: { textTransform: 'none', fontWeight: 600 },
      },
      shape: {
        borderRadius: 12,
      },
    });
  }, [mode]);

  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <CacheProvider value={cache}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
}
