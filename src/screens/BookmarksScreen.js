import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLibrary } from '../context/LibraryContext';

import { NovelRow } from '../components/NovelCard';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import FadeInView from '../components/FadeInView';
import { SPACING, RADIUS } from '../theme/theme';
import { formatPercent, relativeTime } from '../utils/format';

const TABS = ['saved', 'continue', 'history'];

export default function BookmarksScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { savedNovels, continueReading, historyNovels, getProgress, clearHistory } = useLibrary();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('saved');

  const tabLabels = { saved: t('saved'), continue: t('continueReading'), history: t('history') };

  const confirmClearHistory = useCallback(() => {
    Alert.alert(t('clearHistory'), '', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('clearHistory'), style: 'destructive', onPress: clearHistory },
    ]);
  }, [clearHistory, t]);

  const openReader = (id) => navigation.navigate('Reader', { id });
  const openDetails = (id) => navigation.navigate('NovelDetails', { id });

  const renderContent = () => {
    if (tab === 'saved') {
      if (savedNovels.length === 0) {
        return <EmptyState icon="bookmark-outline" title={t('noBookmarksTitle')} body={t('noBookmarksBody')} />;
      }
      return (
        <FlatList
          data={savedNovels}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const p = getProgress(item.id);
            return (
              <NovelRow
                novel={item}
                onPress={() => openDetails(item.id)}
                subtitle={p && p.percent > 0 ? `${formatPercent(p.percent)} ${t('complete')}` : undefined}
                progressPercent={p ? p.percent : 0}
                right={<ReadMini label={t('read')} onPress={() => openReader(item.id)} />}
              />
            );
          }}
        />
      );
    }

    if (tab === 'continue') {
      if (continueReading.length === 0) {
        return <EmptyState icon="play-circle-outline" title={t('noContinueTitle')} body={t('noContinueBody')} />;
      }
      return (
        <FlatList
          data={continueReading}
          keyExtractor={(i) => i.novel.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <NovelRow
              novel={item.novel}
              onPress={() => openDetails(item.novel.id)}
              subtitle={`${t('page')} ${item.page} · ${formatPercent(item.percent)} ${t('complete')}`}
              progressPercent={item.percent}
              right={<ReadMini label={t('continueReading')} onPress={() => openReader(item.novel.id)} />}
            />
          )}
        />
      );
    }

    // history
    if (historyNovels.length === 0) {
      return <EmptyState icon="time-outline" title={t('noHistoryTitle')} body={t('noHistoryBody')} />;
    }
    return (
      <FlatList
        data={historyNovels}
        keyExtractor={(i) => i.novel.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <NovelRow
            novel={item.novel}
            onPress={() => openDetails(item.novel.id)}
            subtitle={`${relativeTime(item.at)}${item.progress ? ` · ${formatPercent(item.progress.percent)}` : ''}`}
            progressPercent={item.progress ? item.progress.percent : 0}
            right={<ReadMini label={t('read')} onPress={() => openReader(item.novel.id)} />}
          />
        )}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('bookmarks')}</Text>
        {tab === 'history' && historyNovels.length > 0 ? (
          <Pressable onPress={confirmClearHistory} hitSlop={8} style={[styles.clearBtn, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>

      {/* Segmented control */}
      <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
        {TABS.map((key) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[styles.segmentBtn, tab === key && { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.segmentText, { color: tab === key ? colors.primary : colors.textMuted }]}>
              {tabLabels[key]}
            </Text>
          </Pressable>
        ))}
      </View>

      <FadeInView key={tab} style={{ flex: 1 }} offset={8} duration={280}>
        {renderContent()}
      </FadeInView>
    </View>
  );
}

function ReadMini({ label, onPress }) {
  return (
    <Button
      label={label}
      icon="book-outline"
      onPress={onPress}
      style={{ paddingVertical: 8, paddingHorizontal: SPACING.md, minHeight: 34 }}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  clearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xxl,
  },
});
