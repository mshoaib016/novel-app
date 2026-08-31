import React from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../theme/theme';

/**
 * Grouped settings building blocks: Section, Row, ToggleRow.
 * These give the Settings screen a clean, consistent, card-grouped look.
 */

export function Section({ title, children, footer }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      {title ? <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text> : null}
      <View style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
      {footer ? <Text style={[styles.footer, { color: colors.textFaint }]}>{footer}</Text> : null}
    </View>
  );
}

export function Row({ icon, label, value, onPress, right, danger, last }) {
  const { colors } = useTheme();
  const tint = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      android_ripple={onPress ? { color: 'rgba(0,0,0,0.05)' } : undefined}
      style={[styles.row, !last && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: danger ? 'rgba(217,83,79,0.12)' : colors.surfaceAlt }]}>
          <Ionicons name={icon} size={18} color={danger ? colors.danger : colors.primary} />
        </View>
      ) : null}
      <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value != null ? (
          <Text style={[styles.value, { color: colors.textMuted }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {right}
        {onPress && !right ? <Ionicons name="chevron-forward" size={18} color={colors.textFaint} /> : null}
      </View>
    </Pressable>
  );
}

export function ToggleRow({ icon, label, value, onValueChange, last }) {
  const { colors } = useTheme();
  return (
    <Row
      icon={icon}
      label={label}
      last={last}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor="#fff"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
  },
  group: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    minHeight: 54,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  value: {
    fontSize: 14,
    marginRight: 6,
    maxWidth: 160,
  },
  footer: {
    fontSize: 12,
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.lg,
    lineHeight: 17,
  },
});
