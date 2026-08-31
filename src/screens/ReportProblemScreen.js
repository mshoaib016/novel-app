import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert, Linking } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { SPACING, RADIUS } from '../theme/theme';
import { sendFormEmail, SUPPORT_EMAIL } from '../utils/mailer';

const PROBLEM_TYPES = [
  { id: 'novel_wont_open', label: "A novel won't open" },
  { id: 'app_crash', label: 'App crashed' },
  { id: 'display', label: 'Display / reading issue' },
  { id: 'other', label: 'Other' },
];

export default function ReportProblemScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useSettings();

  const [type, setType] = useState(PROBLEM_TYPES[0].id);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const typeLabel = PROBLEM_TYPES.find((p) => p.id === type)?.label || '';

  const openMailFallback = useCallback(() => {
    const subject = `Urdu Novel Library — ${typeLabel}`;
    const body = `Problem type: ${typeLabel}\nFrom: ${email || '—'}\n\n${message}`;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('reportProblem'), SUPPORT_EMAIL));
  }, [typeLabel, email, message, t]);

  const onSend = useCallback(async () => {
    if (!message.trim()) {
      Alert.alert('Add a description', 'Please describe the problem before sending.');
      return;
    }
    setSending(true);
    const res = await sendFormEmail({
      name: 'App user',
      email,
      subject: `Urdu Novel Library — ${typeLabel}`,
      message: `Problem type: ${typeLabel}\n\n${message}`,
    });
    setSending(false);
    if (res.ok) {
      Alert.alert(t('reportProblem'), 'Thanks — your report has been sent.');
      setEmail('');
      setMessage('');
      navigation.goBack();
    } else {
      openMailFallback();
    }
  }, [message, email, typeLabel, t, navigation, openMailFallback]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('reportProblem')} onBack={() => navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
      >
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>What kind of problem?</Text>
          <View style={styles.chipRow}>
            {PROBLEM_TYPES.map((p) => {
              const active = p.id === type;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setType(p.id)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceAlt,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : colors.textMuted }]}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.label, { color: colors.text, marginTop: SPACING.md }]}>
            Your email (optional)
          </Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="So we can follow up"
            placeholderTextColor={colors.textFaint}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: colors.text, marginTop: SPACING.md }]}>
            What went wrong?
          </Text>
          <TextInput
            style={[styles.input, styles.textarea, { borderColor: colors.border, color: colors.text }]}
            placeholder="Describe the issue in a few sentences…"
            placeholderTextColor={colors.textFaint}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
          />

          <Button
            label="Send Report"
            icon="send"
            onPress={onSend}
            loading={sending}
            fullWidth
            style={{ marginTop: SPACING.lg }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
});
