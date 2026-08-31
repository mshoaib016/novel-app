import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import Segmented from './Segmented';
import Button from './Button';
import { SPACING, RADIUS, elevation } from '../theme/theme';

/* Expo weekday convention: 1 = Sunday … 7 = Saturday */
const WEEKDAYS = [
  { wd: 1, en: 'S', ur: 'اتوار' },
  { wd: 2, en: 'M', ur: 'پیر' },
  { wd: 3, en: 'T', ur: 'منگل' },
  { wd: 4, en: 'W', ur: 'بدھ' },
  { wd: 5, en: 'T', ur: 'جمعرات' },
  { wd: 6, en: 'F', ur: 'جمعہ' },
  { wd: 7, en: 'S', ur: 'ہفتہ' },
];

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function to12h(hour24) {
  const period = hour24 >= 12 ? 'PM' : 'AM';
  let h = hour24 % 12;
  if (h === 0) h = 12;
  return { h, period };
}

function buildUpcomingDates(count = 30) {
  const out = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d);
  }
  return out;
}

/**
 * Stepper "wheel" for a single numeric value (hour or minute). Big, tappable
 * chevrons above and below a large number — no native dependency.
 */
function NumberStepper({ value, display, onUp, onDown, colors, label }) {
  return (
    <View style={styles.stepperCol}>
      <Pressable onPress={onUp} hitSlop={8} style={styles.chevBtn} android_ripple={{ color: colors.border, borderless: true }}>
        <Ionicons name="chevron-up" size={26} color={colors.textMuted} />
      </Pressable>
      <View style={[styles.numberBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
        <Text style={[styles.numberText, { color: colors.text }]}>{display}</Text>
      </View>
      <Pressable onPress={onDown} hitSlop={8} style={styles.chevBtn} android_ripple={{ color: colors.border, borderless: true }}>
        <Ionicons name="chevron-down" size={26} color={colors.textMuted} />
      </Pressable>
      {label ? <Text style={[styles.stepperLabel, { color: colors.textFaint }]}>{label}</Text> : null}
    </View>
  );
}

/**
 * Reading-reminder picker. Fully custom (no native date/time picker dep) so it
 * behaves identically on Android and iOS and adds zero build risk.
 *
 * Props:
 *   visible, onClose
 *   initial  { mode, hour, minute, weekdays, date }
 *   onSave(config)  -> parent schedules + persists
 */
export default function ReminderModal({ visible, onClose, initial, onSave }) {
  const { colors } = useTheme();
  const { t, isRTL } = useSettings();

  const [mode, setMode] = useState('daily');
  const [hour, setHour] = useState(20); // 0..23
  const [minute, setMinute] = useState(0);
  const [weekdays, setWeekdays] = useState([2, 3, 4, 5, 6]);
  const [dateISO, setDateISO] = useState(null);
  const [saving, setSaving] = useState(false);

  const upcoming = useMemo(() => buildUpcomingDates(30), []);

  // Entrance animation.
  const anim = useRef(new Animated.Value(0)).current;

  // Sync incoming config whenever the modal opens.
  useEffect(() => {
    if (!visible) return;
    const cfg = initial || {};
    setMode(cfg.mode || 'daily');
    setHour(typeof cfg.hour === 'number' ? cfg.hour : 20);
    setMinute(typeof cfg.minute === 'number' ? cfg.minute : 0);
    setWeekdays(Array.isArray(cfg.weekdays) && cfg.weekdays.length ? cfg.weekdays : [2, 3, 4, 5, 6]);
    setDateISO(cfg.date || upcoming[0].toISOString());
    setSaving(false);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onClose && onClose());
  };

  const { h: h12, period } = to12h(hour);

  const stepHourUp = () => setHour((h) => (h + 1) % 24);
  const stepHourDown = () => setHour((h) => (h + 23) % 24);
  const stepMinUp = () => setMinute((m) => (m + 5) % 60);
  const stepMinDown = () => setMinute((m) => (m + 55) % 60);
  const togglePeriod = () => setHour((h) => (h + 12) % 24);

  const toggleWeekday = (wd) => {
    setWeekdays((prev) => {
      if (prev.includes(wd)) return prev.filter((x) => x !== wd);
      return [...prev, wd].sort((a, b) => a - b);
    });
  };

  const summaryTime = `${h12}:${pad(minute)} ${period}`;

  const canSave =
    mode !== 'weekly' || weekdays.length > 0; // weekly needs at least one day

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    const config = { mode, hour, minute, weekdays, date: dateISO };
    try {
      await onSave(config);
    } finally {
      setSaving(false);
      close();
    }
  };

  const fmtDateChip = (d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return isRTL ? 'آج' : 'Today';
    if (diff === 1) return isRTL ? 'کل' : 'Tomorrow';
    return d.toLocaleDateString(isRTL ? 'ur' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const backdropStyle = { opacity: anim };
  const sheetStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
      },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
            elevation(colors, 6),
            sheetStyle,
          ]}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '1A' }]}>
              <Ionicons name="alarm" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[styles.title, { color: colors.text }]}>{t('reminderTitle')}</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('reminderSubtitle')}</Text>
            </View>
            <Pressable onPress={close} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.sm }}>
            {/* Mode */}
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { key: 'daily', label: t('reminderDaily') },
                { key: 'weekly', label: t('reminderWeekly') },
                { key: 'once', label: t('reminderOnce') },
              ]}
              style={{ marginBottom: SPACING.lg }}
            />

            {/* Time picker */}
            <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{t('reminderTime')}</Text>
            <View style={styles.timeRow}>
              <NumberStepper
                display={pad(h12)}
                onUp={stepHourUp}
                onDown={stepHourDown}
                colors={colors}
                label={t('reminderHourLabel')}
              />
              <Text style={[styles.colon, { color: colors.text }]}>:</Text>
              <NumberStepper
                display={pad(minute)}
                onUp={stepMinUp}
                onDown={stepMinDown}
                colors={colors}
                label={t('reminderMinuteLabel')}
              />
              <Pressable
                onPress={togglePeriod}
                style={[styles.periodBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              >
                <Text style={styles.periodText}>{period}</Text>
                <Ionicons name="swap-vertical" size={14} color="#FFFFFF" style={{ marginTop: 2 }} />
              </Pressable>
            </View>

            {/* Weekly day chips */}
            {mode === 'weekly' ? (
              <View style={{ marginTop: SPACING.lg }}>
                <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{t('reminderDays')}</Text>
                <View style={styles.daysRow}>
                  {WEEKDAYS.map((d) => {
                    const active = weekdays.includes(d.wd);
                    return (
                      <Pressable
                        key={d.wd}
                        onPress={() => toggleWeekday(d.wd)}
                        style={[
                          styles.dayChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surfaceAlt,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.dayChipText, { color: active ? '#FFFFFF' : colors.textMuted }]}>
                          {d.en}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {weekdays.length === 0 ? (
                  <Text style={[styles.warn, { color: colors.danger }]}>{t('reminderPickDay')}</Text>
                ) : null}
              </View>
            ) : null}

            {/* Once date scroller */}
            {mode === 'once' ? (
              <View style={{ marginTop: SPACING.lg }}>
                <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{t('reminderDate')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {upcoming.map((d) => {
                    const iso = d.toISOString();
                    const active = dateISO && new Date(dateISO).toDateString() === d.toDateString();
                    return (
                      <Pressable
                        key={iso}
                        onPress={() => setDateISO(iso)}
                        style={[
                          styles.dateChip,
                          {
                            backgroundColor: active ? colors.primary : colors.surfaceAlt,
                            borderColor: active ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.dateChipText, { color: active ? '#FFFFFF' : colors.text }]}>
                          {fmtDateChip(d)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Summary line */}
            <View style={[styles.summary, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="notifications-outline" size={16} color={colors.primary} />
              <Text style={[styles.summaryText, { color: colors.textMuted }]}>
                {mode === 'daily' && `${t('reminderEveryDay')} · ${summaryTime}`}
                {mode === 'weekly' &&
                  `${weekdays.length ? weekdays.map((wd) => WEEKDAYS.find((x) => x.wd === wd)?.en || '').join(' ') : '—'} · ${summaryTime}`}
                {mode === 'once' && `${dateISO ? fmtDateChip(new Date(dateISO)) : ''} · ${summaryTime}`}
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button label={t('cancel')} variant="secondary" onPress={close} style={{ flex: 1, marginRight: SPACING.sm }} />
            <Button
              label={t('reminderSet')}
              icon="checkmark"
              onPress={handleSave}
              loading={saving}
              disabled={!canSave}
              style={{ flex: 1.4 }}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    maxHeight: '88%',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12.5, marginTop: 2 },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepperCol: { alignItems: 'center' },
  chevBtn: { padding: 4 },
  numberBox: {
    width: 74,
    height: 66,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  numberText: { fontSize: 34, fontWeight: '800', fontVariant: ['tabular-nums'] },
  stepperLabel: { fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  colon: { fontSize: 34, fontWeight: '800', marginHorizontal: SPACING.sm, marginBottom: 18 },
  periodBtn: {
    marginLeft: SPACING.lg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minWidth: 58,
    marginBottom: 18,
  },
  periodText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipText: { fontSize: 15, fontWeight: '800' },
  warn: { fontSize: 12, marginTop: SPACING.sm },
  dateChip: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
  },
  dateChipText: { fontSize: 13, fontWeight: '700' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  summaryText: { fontSize: 13, fontWeight: '600', marginLeft: SPACING.sm, flex: 1 },
  actions: { flexDirection: 'row', marginTop: SPACING.lg },
});
