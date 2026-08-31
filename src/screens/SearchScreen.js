import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import novels from '../data/novels';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';

import SearchBar from '../components/SearchBar';
import { NovelRow } from '../components/NovelCard';
import EmptyState from '../components/EmptyState';
import { SPACING } from '../theme/theme';

export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return novels.filter((n) => {
      return (
        n.title.toLowerCase().includes(q) ||
        (n.titleUrdu || '').includes(query.trim()) ||
        n.author.toLowerCase().includes(q) ||
        (n.authorUrdu || '').includes(query.trim())
      );
    });
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={[styles.back, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            autoFocus
            onClear={() => setQuery('')}
          />
        </View>
      </View>

      {query.trim().length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={t('searchPlaceholder')}
          body={t('allNovels')}
        />
      ) : results.length === 0 ? (
        <EmptyState icon="sad-outline" title={t('empty')} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          contentContainerStyle={{ paddingTop: SPACING.md, paddingBottom: SPACING.xxl }}
          ListHeaderComponent={
            <Text style={[styles.count, { color: colors.textMuted }]}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </Text>
          }
          renderItem={({ item }) => (
            <NovelRow novel={item} onPress={() => navigation.navigate('NovelDetails', { id: item.id })} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.lg,
    marginRight: SPACING.xs,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
});
