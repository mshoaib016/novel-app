import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import Segmented from '../components/Segmented';
import LabeledSlider from '../components/LabeledSlider';
import Chip from '../components/Chip';
import { ToggleRow } from '../components/Row';
import {
  SPACING,
  RADIUS,
  FONT_FAMILIES,
  FONT_SIZE,
  LINE_HEIGHT,
  PAGE_MARGIN,
  TEXT_ALIGN_OPTIONS,
} from '../theme/theme';

/**
 * Bottom-sheet with every reader control. Typography controls apply to
 * text-format novels; for PDFs the panel highlights display controls
 * (theme, mode, zoom) and shows the typography options with a hint.
 */
export default function ReaderSettingsSheet({ visible, onClose, isPdf, zoom, onZoomChange }) {
  const { colors } = useTheme();
  const { settings, setSetting, t, isRTL } = useSettings();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={[styles.heading, { color: colors.text }]}>{t('reading')}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xl }}>
          {/* Display */}
          <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{t('theme')}</Text>
          <Segmented
            value={settings.readerTheme}
            onChange={(v) => setSetting('readerTheme', v)}
            options={[
              { key: 'light', label: t('light'), icon: 'sunny-outline' },
              { key: 'dark', label: t('dark'), icon: 'moon-outline' },
              { key: 'sepia', label: t('sepia'), icon: 'book-outline' },
            ]}
          />

          <Text style={[styles.groupLabel, { color: colors.textMuted, marginTop: SPACING.lg }]}>
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

          {isPdf ? (
            <View style={{ marginTop: SPACING.md }}>
              <LabeledSlider
                label="Zoom"
                value={zoom}
                min={0.6}
                max={2.6}
                step={0.1}
                onChange={onZoomChange}
                format={(v) => `${Math.round(v * 100)}%`}
              />
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Typography */}
          <View style={styles.typoHeader}>
            <Text style={[styles.groupLabel, { color: colors.textMuted, marginTop: 0 }]}>
              {t('fontFamily')}
            </Text>
            {isPdf ? (
              <Text style={[styles.hint, { color: colors.textFaint }]}>· applies to text novels</Text>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.sm }}>
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

          <Text style={[styles.groupLabel, { color: colors.textMuted, marginTop: SPACING.md }]}>
            {t('textAlignment')}
          </Text>
          <Segmented
            value={settings.textAlign}
            onChange={(v) => setSetting('textAlign', v)}
            options={TEXT_ALIGN_OPTIONS.map((o) => ({
              key: o.key,
              label: isRTL ? o.labelUrdu : o.label,
            }))}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={[styles.group, { borderColor: colors.border }]}>
            <ToggleRow
              icon="phone-portrait-outline"
              label={t('keepScreenOn')}
              value={settings.keepScreenOn}
              onValueChange={(v) => setSetting('keepScreenOn', v)}
              last
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    maxHeight: '82%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(128,128,128,0.4)',
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: 19,
    fontWeight: '800',
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  typoHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  hint: {
    fontSize: 11,
    marginLeft: 6,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: SPACING.lg,
  },
  group: {
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
