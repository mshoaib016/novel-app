import React from "react";
import { StyleSheet, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import Header from "../components/Header";
import { useTheme } from "../theme/ThemeContext";
import { radius } from "../theme/colors";

export default function PrivacyPolicyScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <Header title="Privacy Policy" showBack onBack={() => navigation.goBack()} />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.card}>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Last updated: [date]
            </Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>What we collect</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Novel Reader does not require an account, and does not collect
              or transmit any personal information. Any PDF files you add are
              stored on your own device.
            </Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>Bookmarks</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Bookmarks (page numbers and notes you save while reading) are
              stored locally on your device only. They are never uploaded or
              shared with anyone.
            </Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>Third-party services</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              This app does not use any third-party analytics or advertising
              services. [Update this if you add any later.]
            </Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>Contact</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              If you have questions about this policy, contact us at:
              [your email address]
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    borderRadius: radius.md,
    padding: 18,
  },
  heading: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
  },
});
