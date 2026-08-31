import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { SPACING } from '../theme/theme';

/**
 * Section header with an optional "See all" action, used on the Home screen.
 */
export default function SectionHeader({ title, onSeeAll }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  return (
    <View style={styles.row}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text style={[styles.action, { color: colors.primary }]}>{t('seeAll')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
  },
  action: {
    fontSize: 14,
    fontWeight: '600',
  },
});
