import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemePreference = 'system' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

// In-memory mock storage layer as requested (not real browser storage yet)
const mockStorage: Record<string, string> = {
  theme_override: 'system',
};

interface ThemeContextType {
  themePreference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themePreference, setThemePrefState] = useState<ThemePreference>(() => {
    return (mockStorage['theme_override'] as ThemePreference) || 'system';
  });

  const getSystemTheme = (): ResolvedTheme => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const initialPref = (mockStorage['theme_override'] as ThemePreference) || 'system';
    if (initialPref === 'dark') return 'dark';
    if (initialPref === 'light') return 'light';
    return getSystemTheme();
  });

  // Apply theme attribute to document element to avoid flash
  const applyTheme = (theme: ResolvedTheme) => {
    setResolvedTheme(theme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  // Sync when preference or system changes
  useEffect(() => {
    if (themePreference === 'dark') {
      applyTheme('dark');
    } else if (themePreference === 'light') {
      applyTheme('light');
    } else {
      applyTheme(getSystemTheme());
    }

    if (themePreference === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themePreference]);

  const setThemePreference = (pref: ThemePreference) => {
    mockStorage['theme_override'] = pref;
    setThemePrefState(pref);
  };

  return (
    <ThemeContext.Provider value={{ themePreference, resolvedTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
