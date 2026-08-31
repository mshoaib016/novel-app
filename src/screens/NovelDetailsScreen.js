import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Share, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import novels from '../data/novels';
import { CATEGORIES } from '../data/novels';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLibrary } from '../context/LibraryContext';

import ScreenHeader from '../components/ScreenHeader';
import Cover from '../components/Cover';
import Button from '../components/Button';
import FadeInView from '../components/FadeInView';
import { SPACING, RADIUS, elevation } from '../theme/theme';

export default function NovelDetailsScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { isBookmarked, toggleBookmark, getProgress } = useLibrary();

  const novel = novels.find((n) => n.id === route.params?.id);

  if (!novel) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="" />
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>{t('readerError')}</Text>
      </View>
    );
  }

  const saved = isBookmarked(novel.id);
  const progress = getProgress(novel.id);
  const category = CATEGORIES.find((c) => c.key === novel.category);

  // The novel ships inside the app, so reading works instantly whether the
  // device is online or offline — no download step needed.
  const handleRead = useCallback(() => {
    navigation.navigate('Reader', { id: novel.id });
  }, [novel.id, navigation]);

  const onShare = useCallback(() => {
    Share.share({
      title: novel.title,
      message: `📖 ${novel.title} (${novel.titleUrdu})\n${t('by')} ${novel.author}\n\n${novel.description}`,
    });
  }, [novel, t]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title=""
        transparent
        actions={[
          { icon: 'share-social-outline', onPress: onShare },
          {
            icon: saved ? 'bookmark' : 'bookmark-outline',
            onPress: () => toggleBookmark(novel.id),
            color: saved ? colors.accent : colors.text,
          },
        ]}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <FadeInView delay={0} offset={16}>
        <View style={styles.hero}>
          <View style={elevation(colors, 6)}>
            <Cover novel={novel} width={168} height={240} radius={RADIUS.lg} />
          </View>
          <Text style={[styles.titleUrdu, { color: colors.text }]}>{novel.titleUrdu}</Text>
          <Text style={[styles.title, { color: colors.textMuted }]}>{novel.title}</Text>
          <Text style={[styles.author, { color: colors.primary }]}>
            {t('by')} {novel.author}
          </Text>

          {/* meta */}
          <View style={styles.metaRow}>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="star" size={14} color={colors.star} />
              <Text style={[styles.metaText, { color: colors.text }]}>{novel.rating?.toFixed(1)}</Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="document-text-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {novel.pages} {t('pages')}
              </Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="cloud-done-outline" size={14} color={colors.textMuted} />
              <Text style={[styles.metaText, { color: colors.text }]}>Works offline</Text>
            </View>
            {category ? (
              <Pressable
                onPress={() => navigation.navigate('Category', { categoryKey: category.key })}
                style={[styles.metaPill, { backgroundColor: colors.surfaceAlt }]}
              >
                <Ionicons name={category.icon} size={14} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.text }]}>{category.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        </FadeInView>

        {/* Actions */}
        <FadeInView delay={80}>
        <View style={styles.actions}>
          <Button
            label={progress && progress.percent > 0 ? t('continueReading') : t('read')}
            icon="book"
            onPress={handleRead}
            fullWidth
            style={{ flex: 1 }}
          />
        </View>
        </FadeInView>

        {/* Description */}
        <FadeInView delay={160}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('about')}</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>{novel.description}</Text>
        </View>
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.sm,
  },
  titleUrdu: {
    fontSize: 26,
    fontWeight: '800',
    writingDirection: 'rtl',
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  author: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    margin: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  desc: {
    fontSize: 15,
    lineHeight: 24,
  },
});
