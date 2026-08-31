import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { RADIUS, SPACING, elevation } from '../theme/theme';

/**
 * Search box. Can act as a real input (onChangeText) or as a button that
 * navigates to the search screen (onPress + editable=false).
 */
export default function SearchBar({
  value,
  onChangeText,
  onPress,
  editable = true,
  autoFocus = false,
  onClear,
}) {
  const { colors } = useTheme();
  const { t, isRTL } = useSettings();

  const inner = (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        elevation(colors, 1),
      ]}
    >
      <Ionicons name="search" size={20} color={colors.textMuted} />
      <TextInput
        style={[styles.input, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
        placeholder={t('searchPlaceholder')}
        placeholderTextColor={colors.textFaint}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {value ? (
        <Pressable onPress={onClear} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.textFaint} />
        </Pressable>
      ) : null}
    </View>
  );

  if (!editable && onPress) {
    return (
      <Pressable onPress={onPress} style={styles.wrap}>
        {inner}
      </Pressable>
    );
  }
  return <View style={styles.wrap}>{inner}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: SPACING.lg,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    marginHorizontal: SPACING.sm,
    paddingVertical: 0,
  },
});
