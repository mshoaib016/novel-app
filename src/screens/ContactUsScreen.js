import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import ScreenHeader from '../components/ScreenHeader';
import Button from '../components/Button';
import { SPACING, RADIUS } from '../theme/theme';
import { sendFormEmail, SUPPORT_EMAIL } from '../utils/mailer';

export default function ContactUsScreen({ navigation }) {
  const { colors } = useTheme();
  const { t } = useSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const openMailFallback = useCallback(() => {
    const body = `From: ${name || '—'} (${email || '—'})\n\n${message}`;
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      'Urdu Novel Library — Contact'
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('contactUs'), SUPPORT_EMAIL));
  }, [name, email, message, t]);

  const onSend = useCallback(async () => {
    if (!message.trim()) {
      Alert.alert(t('contactUs'), 'Please write a message before sending.');
      return;
    }
    setSending(true);
    const res = await sendFormEmail({
      name,
      email,
      subject: 'Urdu Novel Library — Contact',
      message,
    });
    setSending(false);
    if (res.ok) {
      Alert.alert(t('contactUs'), 'Thanks! Your message has been sent.');
      setName('');
      setEmail('');
      setMessage('');
      navigation.goBack();
    } else {
      // EmailJS not configured yet (or the request failed) — fall back to
      // opening the user's own mail app with everything pre-filled.
      openMailFallback();
    }
  }, [name, email, message, t, navigation, openMailFallback]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={t('contactUs')} onBack={() => navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: SPACING.xxl }}
      >
        <Text style={[styles.intro, { color: colors.textMuted }]}>
          Questions, feedback, or a novel request? We'd love to hear from you.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Your name</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Optional"
            placeholderTextColor={colors.textFaint}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.label, { color: colors.text, marginTop: SPACING.md }]}>Your email</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="So we can reply to you"
            placeholderTextColor={colors.textFaint}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: colors.text, marginTop: SPACING.md }]}>Message</Text>
          <TextInput
            style={[styles.input, styles.textarea, { borderColor: colors.border, color: colors.text }]}
            placeholder="Write your message here…"
            placeholderTextColor={colors.textFaint}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
          />

          <Button
            label="Send Message"
            icon="send"
            onPress={onSend}
            loading={sending}
            fullWidth
            style={{ marginTop: SPACING.lg }}
          />
        </View>

        <View style={[styles.altRow, { borderColor: colors.border }]}>
          <Ionicons name="mail-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.altText, { color: colors.textMuted }]}>
            Or email us directly at {SUPPORT_EMAIL}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
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
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  altText: {
    fontSize: 12.5,
    marginLeft: 8,
  },
});
