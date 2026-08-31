import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../theme/theme';

/**
 * Labeled slider row used for continuous reader settings (font size, spacing,
 * margins, zoom, brightness).
 */
export default function LabeledSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  disabled,
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, disabled && { opacity: 0.4 }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          {format ? format(value) : value}
        </Text>
      </View>
      <Slider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});
