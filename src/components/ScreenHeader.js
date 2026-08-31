import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../theme/theme';

/**
 * Consistent top bar for stacked screens: back button, centered title,
 * and an optional set of right-side action buttons.
 * `actions` = array of { icon, onPress, color }.
 */
export default function ScreenHeader({ title, subtitle, actions = [], onBack, transparent }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 6,
          backgroundColor: transparent ? 'transparent' : colors.surface,
          borderBottomColor: transparent ? 'transparent' : colors.border,
        },
      ]}
    >
      <Pressable
        onPress={onBack || (() => navigation.goBack())}
        hitSlop={10}
        style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt }]}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>

      <View style={styles.titleWrap}>
        {title ? (
          <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {actions.map((a, i) => (
          <Pressable
            key={i}
            onPress={a.onPress}
            hitSlop={10}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, marginLeft: SPACING.sm }]}
          >
            <Ionicons name={a.icon} size={20} color={a.color || colors.text} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
