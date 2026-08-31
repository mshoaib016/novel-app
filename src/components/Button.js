import React, { useRef } from 'react';
import { Text, StyleSheet, ActivityIndicator, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING } from '../theme/theme';

/**
 * Reusable button.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * Gently scales down while pressed (native-driver spring) for a tactile feel.
 */
export default function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const busy = disabled || loading;

  const spring = (toValue, bounciness) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 50, bounciness }).start();

  const palette = {
    primary: { bg: colors.primary, fg: '#FFFFFF', border: 'transparent' },
    secondary: { bg: colors.surfaceAlt, fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
  }[variant];

  return (
    <Animated.View style={{ transform: [{ scale }], alignSelf: fullWidth ? 'stretch' : 'auto' }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => !busy && spring(0.97, 0)}
        onPressOut={() => !busy && spring(1, 8)}
        disabled={busy}
        android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
        style={({ pressed }) => [
          styles.base,
          {
            backgroundColor: palette.bg,
            borderColor: palette.border,
            borderWidth: palette.border === 'transparent' ? 0 : 1.5,
            opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
            alignSelf: fullWidth ? 'stretch' : 'auto',
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={palette.fg} size="small" />
        ) : (
          <>
            {icon ? <Ionicons name={icon} size={18} color={palette.fg} style={{ marginRight: 8 }} /> : null}
            <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: 48,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
