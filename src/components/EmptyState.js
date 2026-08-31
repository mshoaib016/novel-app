import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../theme/theme';

/**
 * Friendly empty-state block used across Downloads, Bookmarks, History, etc.
 */
export default function EmptyState({ icon = 'sparkles-outline', title, body, children }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
      {body ? <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text> : null}
      {children ? <View style={{ marginTop: SPACING.lg }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: 60,
  },
  iconWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 300,
  },
});
