import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../theme/theme';

/**
 * Pill chip used for categories and small toggles.
 */
export default function Chip({ label, icon, active = false, onPress, style }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={15}
          color={active ? '#FFFFFF' : colors.textMuted}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text style={[styles.label, { color: active ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginRight: SPACING.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
