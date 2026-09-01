import React from "react";
import { StyleSheet, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../components/GlassCard";
import Header from "../components/Header";
import { useTheme } from "../theme/ThemeContext";
import { radius } from "../theme/colors";

export default function TermsScreen({ navigation }) {
  const { colors } = useTheme();
  return (
    <LinearGradient colors={colors.bgGradient} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <Header title="Terms & Conditions" showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.card}>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>Last updated: [date]</Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>Use of the App</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              NovelSpot is provided for personal reading use. You may download novels for offline
              reading on your own device.
            </Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>Content Rights</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              [State here who owns the novels/content in your app, and any permissions you have to
              distribute them — this matters for Play Store approval.]
            </Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>Limitation of Liability</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              The app is provided "as is" without warranty of any kind.
            </Text>

            <Text style={[styles.heading, { color: colors.textPrimary }]}>Changes</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              These terms may be updated from time to time. Continued use of the app means you accept
              the current terms.
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 30 },
  card: { borderRadius: radius.md, padding: 18 },
  heading: { fontSize: 14, fontWeight: "800", marginTop: 14, marginBottom: 4 },
  paragraph: { fontSize: 13, lineHeight: 20 },
});
