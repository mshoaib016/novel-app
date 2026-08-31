import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../theme/theme';

/**
 * Compact segmented control. options = [{ key, label, icon }].
 */
export default function Segmented({ options, value, onChange, style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceAlt }, style]}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.seg, active && { backgroundColor: colors.surface }]}
          >
            {opt.icon ? (
              <Ionicons
                name={opt.icon}
                size={15}
                color={active ? colors.primary : colors.textMuted}
                style={{ marginRight: opt.label ? 5 : 0 }}
              />
            ) : null}
            {opt.label ? (
              <Text style={[styles.label, { color: active ? colors.primary : colors.textMuted }]}>
                {opt.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 4,
  },
  seg: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
