import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';

import { PALETTES, LIGHT, DARK } from '../theme/theme';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext(null);

/**
 * Resolves the active color palette from the user's saved theme preference:
 *   - 'system' -> follow the OS (light/dark)
 *   - 'light' | 'dark' | 'sepia' -> use that palette explicitly
 *
 * Also exposes toggleTheme() for the quick Home-screen light/dark switch.
 */
export function ThemeProvider({ children }) {
  const { settings, setSetting } = useSettings();
  const scheme = useColorScheme();

  const colors = useMemo(() => {
    const pref = settings.theme;
    if (pref === 'system' || !pref) {
      return scheme === 'dark' ? DARK : LIGHT;
    }
    return PALETTES[pref] || LIGHT;
  }, [settings.theme, scheme]);

  const toggleTheme = useCallback(() => {
    // Quick toggle used by the Home header. If we're on system/sepia, resolve
    // to the opposite of whatever is currently showing.
    setSetting('theme', colors.isDark ? 'light' : 'dark');
  }, [colors.isDark, setSetting]);

  const setThemeMode = useCallback((mode) => setSetting('theme', mode), [setSetting]);

  const value = useMemo(
    () => ({
      colors,
      isDark: colors.isDark,
      mode: settings.theme,
      systemScheme: scheme,
      toggleTheme,
      setThemeMode,
    }),
    [colors, settings.theme, scheme, toggleTheme, setThemeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
