import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import novels, { CATEGORIES } from '../data/novels';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLibrary } from '../context/LibraryContext';

import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import HorizontalList from '../components/HorizontalList';
import Chip from '../components/Chip';
import FadeInView from '../components/FadeInView';
import { NovelRow } from '../components/NovelCard';
import { SPACING } from '../theme/theme';
import { formatPercent } from '../utils/format';

export default function HomeScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, isRTL } = useSettings();
  const { continueReading, getProgress } = useLibrary();
  const insets = useSafeAreaInsets();

  const featured = useMemo(() => novels.filter((n) => n.featured), []);
  const popular = useMemo(() => novels.filter((n) => n.popular), []);
  const recent = useMemo(
    () => [...novels].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)),
    []
  );

  const openNovel = (novel) => navigation.navigate('NovelDetails', { id: novel.id });
  const openCategory = (key) => navigation.navigate('Category', { categoryKey: key });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.hello, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('appName')}
          </Text>
          <Text style={[styles.brand, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            اردو ناول لائبریری
          </Text>
        </View>
        <Pressable
          onPress={toggleTheme}
          hitSlop={10}
          style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SPACING.xxl }}
      >
        <FadeInView delay={0} style={{ marginTop: SPACING.sm }}>
          <SearchBar editable={false} onPress={() => navigation.navigate('Search')} />
        </FadeInView>

        {/* Continue Reading */}
        {continueReading.length > 0 ? (
          <FadeInView delay={60}>
            <SectionHeader title={t('continueReading')} />
            <HorizontalList
              data={continueReading.map((c) => c.novel)}
              onPressItem={openNovel}
              cardWidth={132}
              showProgress
            />
          </FadeInView>
        ) : null}

        {/* Featured */}
        <FadeInView delay={120}>
          <SectionHeader title={t('featured')} />
          <HorizontalList data={featured} onPressItem={openNovel} cardWidth={150} />
        </FadeInView>

        {/* Categories */}
        <FadeInView delay={180}>
          <SectionHeader title={t('categories')} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
          >
            {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
              <Chip
                key={cat.key}
                label={isRTL ? cat.labelUrdu : cat.label}
                icon={cat.icon}
                onPress={() => openCategory(cat.key)}
              />
            ))}
          </ScrollView>
        </FadeInView>

        {/* Popular */}
        <FadeInView delay={240}>
          <SectionHeader title={t('popular')} />
          <HorizontalList data={popular} onPressItem={openNovel} cardWidth={132} />
        </FadeInView>

        {/* Recently Added */}
        <FadeInView delay={300}>
          <SectionHeader title={t('recentlyAdded')} />
          <HorizontalList data={recent.slice(0, 8)} onPressItem={openNovel} cardWidth={132} />
        </FadeInView>

        {/* All Novels */}
        <FadeInView delay={360}>
          <SectionHeader title={t('allNovels')} onSeeAll={() => openCategory('all')} />
          <View style={{ marginTop: SPACING.xs }}>
            {novels.map((n) => {
              const p = getProgress(n.id);
              return (
                <NovelRow
                  key={n.id}
                  novel={n}
                  onPress={() => openNovel(n)}
                  subtitle={p && p.percent > 0 ? `${formatPercent(p.percent)} ${t('complete')}` : undefined}
                  progressPercent={p ? p.percent : 0}
                />
              );
            })}
          </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  hello: {
    fontSize: 13,
    fontWeight: '600',
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    writingDirection: 'rtl',
    marginTop: 2,
  },
  themeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
