import React, { useCallback } from 'react';
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
import { formatBytes, formatPercent } from '../utils/format';

export default function DownloadsScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { downloadedNovels, storageUsed, removeDownload, getProgress, getDownload, clearAllDownloads } =
    useLibrary();
  const insets = useSafeAreaInsets();

  const confirmDelete = useCallback(
    (novel) => {
      Alert.alert(t('deleteDownload'), novel.title, [
        { text: t('cancel'), style: 'cancel' },
        { text: t('delete'), style: 'destructive', onPress: () => removeDownload(novel.id) },
      ]);
    },
    [removeDownload, t]
  );

  const confirmClearAll = useCallback(() => {
    Alert.alert(t('deleteDownload'), `${downloadedNovels.length} novels · ${formatBytes(storageUsed)}`, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: clearAllDownloads },
    ]);
  }, [downloadedNovels.length, storageUsed, clearAllDownloads, t]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{t('downloads')}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('manageDownloads')}</Text>
        </View>
        {downloadedNovels.length > 0 ? (
          <Pressable onPress={confirmClearAll} hitSlop={8} style={[styles.clearBtn, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
        ) : null}
      </View>

      <FadeInView style={{ flex: 1 }}>
      {downloadedNovels.length === 0 ? (
        <EmptyState icon="cloud-offline-outline" title={t('noDownloadsTitle')} body={t('noDownloadsBody')} />
      ) : (
        <FlatList
          data={downloadedNovels}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: SPACING.xxl }}
          ListHeaderComponent={
            <View style={[styles.storageBanner, { backgroundColor: colors.primary }]}>
              <Ionicons name="folder-open" size={22} color="#fff" />
              <View style={{ flex: 1, marginLeft: SPACING.md }}>
                <Text style={styles.storageLabel}>{t('storageUsed')}</Text>
                <Text style={styles.storageValue}>{formatBytes(storageUsed)}</Text>
              </View>
              <Text style={styles.storageCount}>
                {downloadedNovels.length} {downloadedNovels.length === 1 ? 'novel' : 'novels'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const p = getProgress(item.id);
            const dl = getDownload(item.id);
            return (
              <NovelRow
                novel={item}
                onPress={() => navigation.navigate('NovelDetails', { id: item.id })}
                subtitle={`${formatBytes(dl.size)}${p && p.percent > 0 ? ` · ${formatPercent(p.percent)} ${t('complete')}` : ''}`}
                progressPercent={p ? p.percent : 0}
                right={
                  <View style={styles.rowActions}>
                    <Button
                      label={t('read')}
                      icon="book-outline"
                      onPress={() => navigation.navigate('Reader', { id: item.id })}
                      style={styles.readBtn}
                    />
                    <Pressable onPress={() => confirmDelete(item)} hitSlop={8} style={{ marginTop: 8 }}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </Pressable>
                  </View>
                }
              />
            );
          }}
        />
      )}
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  clearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  storageLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  storageValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  storageCount: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  rowActions: {
    alignItems: 'center',
  },
  readBtn: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.lg,
    minHeight: 36,
  },
});
