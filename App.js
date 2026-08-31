import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { SettingsProvider } from './src/context/SettingsContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LibraryProvider } from './src/context/LibraryContext';
import AppNavigator from './src/navigation/AppNavigator';
import BrightnessOverlay from './src/components/BrightnessOverlay';

/**
 * Root component.
 *
 * Provider order matters:
 *  - SettingsProvider must wrap ThemeProvider (theme is derived from the
 *    user's saved theme preference + the OS color scheme).
 *  - LibraryProvider holds bookmarks / downloads / reading progress and needs
 *    settings (e.g. Wi-Fi-only downloads) so it sits inside SettingsProvider.
 */
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <ThemeProvider>
            <LibraryProvider>
              <ThemedStatusBar />
              <AppNavigator />
              <BrightnessOverlay />
            </LibraryProvider>
          </ThemeProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
