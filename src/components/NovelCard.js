import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Cover from './Cover';
import ProgressBar from './ProgressBar';
import PressableScale from './PressableScale';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import { SPACING, RADIUS, elevation } from '../theme/theme';
import { formatPercent } from '../utils/format';

/**
 * Poster-style card for horizontal carousels and grids.
 * Shows cover, title, author, a bookmark toggle and (optionally) a
 * "downloaded" badge or reading-progress bar.
 */
export function NovelCard({ novel, onPress, width = 140, showBookmark = true, showProgress = false }) {
  const { colors } = useTheme();
  const { isBookmarked, toggleBookmark, getProgress } = useLibrary();
  const saved = isBookmarked(novel.id);
  const progress = showProgress ? getProgress(novel.id) : null;
  const coverHeight = width * 1.42;

  return (
    <PressableScale onPress={onPress} style={[styles.card, { width }]}>
      <View>
        <Cover novel={novel} width={width} height={coverHeight} radius={RADIUS.md} />

        {showBookmark ? (
          <Pressable
            onPress={() => toggleBookmark(novel.id)}
            hitSlop={8}
            style={[styles.heart, { backgroundColor: colors.overlay }]}
          >
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={saved ? colors.accent : '#fff'}
            />
          </Pressable>
        ) : null}
      </View>

      <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
        {novel.title}
      </Text>
      <Text numberOfLines={1} style={[styles.author, { color: colors.textMuted }]}>
        {novel.author}
      </Text>

      {progress && progress.percent > 0 ? (
        <View style={{ marginTop: 4 }}>
          <ProgressBar progress={progress.percent / 100} height={4} />
          <Text style={[styles.progressText, { color: colors.textFaint }]}>
            {formatPercent(progress.percent)}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

/**
 * Wide list row used in All Novels, Search, Downloads, Bookmarks.
 * `right` renders trailing content (buttons / status).
 */
export function NovelRow({ novel, onPress, subtitle, right, progressPercent }) {
  const { colors } = useTheme();
  const { isBookmarked } = useLibrary();
  const saved = isBookmarked(novel.id);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }, elevation(colors, 1)]}
    >
      <Cover novel={novel} width={58} height={82} radius={RADIUS.sm} />
      <View style={styles.rowBody}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.text }]}>
          {novel.title}
        </Text>
        <Text numberOfLines={1} style={[styles.rowUrdu, { color: colors.textMuted }]}>
          {novel.titleUrdu}
        </Text>
        <Text numberOfLines={1} style={[styles.author, { color: colors.textFaint }]}>
          {novel.author}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={[styles.subtitle, { color: colors.primary }]}>
            {subtitle}
          </Text>
        ) : null}
        {typeof progressPercent === 'number' && progressPercent > 0 ? (
          <ProgressBar progress={progressPercent / 100} height={4} style={{ marginTop: 6 }} />
        ) : null}
      </View>
      <View style={styles.rowRight}>
        {saved ? <Ionicons name="bookmark" size={16} color={colors.accent} /> : <View style={{ height: 16 }} />}
        {right}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: SPACING.md,
  },
  badge: {
    position: 'absolute',
    left: 8,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  heart: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  author: {
    fontSize: 12,
    marginTop: 2,
  },
  progressText: {
    fontSize: 10,
    marginTop: 3,
  },
  row: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowUrdu: {
    fontSize: 15,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginTop: 1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: SPACING.sm,
  },
});

export default NovelCard;
