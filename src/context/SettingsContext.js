import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../storage/keys';
import { translate } from '../i18n/strings';
import { FONT_SIZE, LINE_HEIGHT, PAGE_MARGIN } from '../theme/theme';

const DEFAULT_SETTINGS = {
  theme: 'system', // 'system' | 'light' | 'dark' | 'sepia'
  readerTheme: 'sepia', // reading surface theme: 'light' | 'dark' | 'sepia' — easiest on the eyes for long novels
  fontFamilyKey: 'system',
  fontSize: FONT_SIZE.default,
  lineHeight: LINE_HEIGHT.default,
  textAlign: 'right', // Urdu is RTL, so default to right alignment
  pageMargin: PAGE_MARGIN.default,
  readingMode: 'paged', // 'scroll' | 'paged' — paged flips page-to-page like flipping through photos
  keepScreenOn: true,
  brightness: null, // null = follow system; 0..1 overrides while reading
  language: 'en', // 'en' | 'ur'
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load persisted settings once on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
        if (raw && active) {
          const parsed = JSON.parse(raw);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        // ignore corrupt storage, fall back to defaults
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever settings change (after initial load).
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const setSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const t = useCallback((key) => translate(settings.language, key), [settings.language]);

  const isRTL = settings.language === 'ur';

  const value = useMemo(
    () => ({
      settings,
      loaded,
      setSetting,
      updateSettings,
      resetSettings,
      t,
      isRTL,
    }),
    [settings, loaded, setSetting, updateSettings, resetSettings, t, isRTL]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
