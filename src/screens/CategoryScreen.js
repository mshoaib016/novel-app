import React, { useState, useMemo } from 'react';
import { View, ScrollView, FlatList, StyleSheet } from 'react-native';

import novels, { CATEGORIES } from '../data/novels';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

import ScreenHeader from '../components/ScreenHeader';
import Chip from '../components/Chip';
import { NovelRow } from '../components/NovelCard';
import EmptyState from '../components/EmptyState';
import { SPACING } from '../theme/theme';

export default function CategoryScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { t, isRTL } = useSettings();
  const [selected, setSelected] = useState(route.params?.categoryKey || 'all');

  const list = useMemo(
    () => (selected === 'all' ? novels : novels.filter((n) => n.category === selected)),
    [selected]
  );

  const activeCat = CATEGORIES.find((c) => c.key === selected);
  const headerTitle = selected === 'all' ? t('allNovels') : isRTL ? activeCat?.labelUrdu : activeCat?.label;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={headerTitle} subtitle={`${list.length} ${t('allNovels').toLowerCase()}`} />

      <View style={{ paddingVertical: SPACING.md }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
        >
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.key}
              label={isRTL ? cat.labelUrdu : cat.label}
              icon={cat.icon}
              active={selected === cat.key}
              onPress={() => setSelected(cat.key)}
            />
          ))}
        </ScrollView>
      </View>

      {list.length === 0 ? (
        <EmptyState icon="book-outline" title={t('empty')} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: SPACING.xs, paddingBottom: SPACING.xxl }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <NovelRow novel={item} onPress={() => navigation.navigate('NovelDetails', { id: item.id })} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
