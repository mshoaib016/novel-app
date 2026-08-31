import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Share, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLibrary } from '../context/LibraryContext';
import { Section, Row, ToggleRow } from '../components/Row';
import Segmented from '../components/Segmented';
import Chip from '../components/Chip';
import LabeledSlider from '../components/LabeledSlider';
import {
  SPACING,
  RADIUS,
  FONT_FAMILIES,
  FONT_SIZE,
  LINE_HEIGHT,
  PAGE_MARGIN,
  TEXT_ALIGN_OPTIONS,
} from '../theme/theme';

const APP_VERSION = '1.0.0';

export default function SettingsScreen({ navigation }) {
  const { colors, mode, setThemeMode } = useTheme();
  const { settings, setSetting, t, isRTL } = useSettings();
  const { historyNovels, clearHistory } = useLibrary();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);

  const brightnessOn = settings.brightness != null;

  const confirm = (title, message, onYes, destructive) =>
    Alert.alert(title, message, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), style: destructive ? 'destructive' : 'default', onPress: onYes },
    ]);

  const clearCache = async () => {
    setBusy(true);
    try {
      const dir = FileSystem.cacheDirectory;
      if (dir) {
        const entries = await FileSystem.readDirectoryAsync(dir).catch(() => []);
        await Promise.all(
          entries.map((name) => FileSystem.deleteAsync(dir + name, { idempotent: true }).catch(() => {}))
        );
      }
    } finally {
      setBusy(false);
      Alert.alert(t('clearCache'), t('done'));
    }
  };

  const shareApp = () =>
    Share.share({
      message: `${t('appName')} — read Urdu novels, online or offline.`,
    }).catch(() => {});

  const rateApp = () => {
    const url = Platform.select({
      ios: 'itms-apps://itunes.apple.com/app/id000000000?action=write-review',
      android: 'market://details?id=com.urdunovellibrary.app',
      default: 'https://urdunovellibrary.app',
    });
    Linking.openURL(url).catch(() => Alert.alert(t('rateApp'), t('storeUnavailable')));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('settings')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: SPACING.xxl + insets.bottom }}
      >
        {/* ---- READING ---- */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted, marginTop: SPACING.lg }]}>
          {t('reading')}
        </Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.blockLabel, { color: colors.text }]}>{t('fontFamily')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
            {FONT_FAMILIES.map((f) => (
              <Chip
                key={f.key}
                label={isRTL ? f.labelUrdu : f.label}
                active={settings.fontFamilyKey === f.key}
                onPress={() => setSetting('fontFamilyKey', f.key)}
              />
            ))}
          </ScrollView>

          <LabeledSlider
            label={t('fontSize')}
            value={settings.fontSize}
            min={FONT_SIZE.min}
            max={FONT_SIZE.max}
            step={FONT_SIZE.step}
            onChange={(v) => setSetting('fontSize', Math.round(v))}
            format={(v) => `${Math.round(v)}`}
          />
          <LabeledSlider
            label={t('lineSpacing')}
            value={settings.lineHeight}
            min={LINE_HEIGHT.min}
            max={LINE_HEIGHT.max}
            step={LINE_HEIGHT.step}
            onChange={(v) => setSetting('lineHeight', Math.round(v * 10) / 10)}
            format={(v) => `${(Math.round(v * 10) / 10).toFixed(1)}×`}
          />
          <LabeledSlider
            label={t('pageMargins')}
            value={settings.pageMargin}
            min={PAGE_MARGIN.min}
            max={PAGE_MARGIN.max}
            step={PAGE_MARGIN.step}
            onChange={(v) => setSetting('pageMargin', Math.round(v))}
            format={(v) => `${Math.round(v)}`}
          />

          <Text style={[styles.blockLabel, { color: colors.text, marginTop: SPACING.md }]}>
            {t('textAlignment')}
          </Text>
          <Segmented
            value={settings.textAlign}
            onChange={(v) => setSetting('textAlign', v)}
            options={TEXT_ALIGN_OPTIONS.map((o) => ({ key: o.key, label: isRTL ? o.labelUrdu : o.label }))}
          />

          <Text style={[styles.blockLabel, { color: colors.text, marginTop: SPACING.md }]}>
            {t('readingMode')}
          </Text>
          <Segmented
            value={settings.readingMode}
            onChange={(v) => setSetting('readingMode', v)}
            options={[
              { key: 'scroll', label: t('scroll'), icon: 'reorder-two-outline' },
              { key: 'paged', label: t('paged'), icon: 'copy-outline' },
            ]}
          />
          <View style={{ height: SPACING.sm }} />
          <View style={{ marginHorizontal: -SPACING.md, marginBottom: -SPACING.sm }}>
            <ToggleRow
              icon="phone-portrait-outline"
              label={t('keepScreenOn')}
              value={settings.keepScreenOn}
              onValueChange={(v) => setSetting('keepScreenOn', v)}
              last
            />
          </View>
        </View>

        {/* ---- APPEARANCE ---- */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('appearance')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.blockLabel, { color: colors.text }]}>{t('theme')}</Text>
          <Segmented
            value={mode}
            onChange={setThemeMode}
            options={[
              { key: 'system', label: t('systemDefault') },
              { key: 'light', label: t('light') },
              { key: 'dark', label: t('dark') },
              { key: 'sepia', label: t('sepia') },
            ]}
          />
          <Text style={[styles.hint, { color: colors.textFaint }]}>
            {t('readerThemeHint')}
          </Text>

          <View style={{ height: SPACING.md }} />
          <View style={{ marginHorizontal: -SPACING.md }}>
            <ToggleRow
              icon="sunny-outline"
              label={t('brightness')}
              value={brightnessOn}
              onValueChange={(on) => setSetting('brightness', on ? 0.8 : null)}
              last
            />
          </View>
          {brightnessOn ? (
            <LabeledSlider
              label={t('brightness')}
              value={settings.brightness}
              min={0.1}
              max={1}
              step={0.05}
              onChange={(v) => setSetting('brightness', Math.round(v * 20) / 20)}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          ) : null}
        </View>

        {/* ---- LIBRARY ---- */}
        <Section title={t('library')}>
          <Row
            icon="time-outline"
            label={t('readingHistory')}
            value={`${historyNovels.length}`}
            onPress={() => navigation.navigate('Bookmarks')}
          />
          <Row
            icon="trash-outline"
            label={t('clearHistory')}
            danger
            onPress={() =>
              confirm(t('clearHistory'), t('clearHistoryConfirm'), clearHistory, true)
            }
          />
          <Row
            icon="refresh-outline"
            label={t('clearCache')}
            danger
            last
            onPress={() => confirm(t('clearCache'), t('clearCacheConfirm'), clearCache, true)}
          />
        </Section>

        {/* ---- GENERAL ---- */}
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{t('general')}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.blockLabel, { color: colors.text }]}>{t('appLanguage')}</Text>
          <Segmented
            value={settings.language}
            onChange={(v) => setSetting('language', v)}
            options={[
              { key: 'en', label: 'English' },
              { key: 'ur', label: 'اردو' },
            ]}
          />
        </View>

        {/* ---- ABOUT ---- */}
        <Section title={t('aboutHeading')} footer={`${t('appName')} · v${APP_VERSION}`}>
          <Row icon="information-circle-outline" label={t('aboutApp')} onPress={() => navigation.navigate('Info', { kind: 'about' })} />
          <Row icon="shield-checkmark-outline" label={t('privacyPolicy')} onPress={() => navigation.navigate('Info', { kind: 'privacy' })} />
          <Row icon="document-text-outline" label={t('terms')} onPress={() => navigation.navigate('Info', { kind: 'terms' })} />
          <Row icon="mail-outline" label={t('contactUs')} onPress={() => navigation.navigate('ContactUs')} />
          <Row icon="bug-outline" label={t('reportProblem')} onPress={() => navigation.navigate('ReportProblem')} />
          <Row icon="star-outline" label={t('rateApp')} onPress={rateApp} />
          <Row icon="share-social-outline" label={t('shareApp')} onPress={shareApp} />
          <Row icon="pricetag-outline" label={t('appVersion')} value={`v${APP_VERSION}`} last />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
  },
  card: {
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACING.md,
  },
  blockLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: 12,
    marginTop: SPACING.sm,
    lineHeight: 17,
  },
});
