import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSettings } from '../context/SettingsContext';

/**
 * App-wide screen dimmer.
 *
 * When the user lowers "Brightness" below 100% in Settings, we render a
 * translucent black layer over the ENTIRE app. This approach:
 *   - works identically on Android and iOS,
 *   - needs no system permission (unlike hardware brightness control), and
 *   - is visible immediately, everywhere — including on the Settings screen
 *     while the user drags the slider.
 *
 * brightness === null  -> follow the system (no dimming).
 * brightness  1.0      -> full brightness (no dimming).
 * brightness  0.1      -> heavily dimmed for comfortable night reading.
 */
export default function BrightnessOverlay() {
  const { settings } = useSettings();
  const b = settings.brightness;
  if (b == null || b >= 1) return null;
  // Map brightness (0.1..1) to a dim opacity (0.8..0), capped so the screen
  // never goes fully black and stays readable.
  const opacity = Math.min(0.8, Math.max(0, 1 - b));
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000000', opacity }]}
    />
  );
}
