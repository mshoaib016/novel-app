import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import Header from "../components/Header";
import { useTheme } from "../theme/ThemeContext";
import { radius } from "../theme/colors";
import appJson from "../../app.json";

export default function AboutAppScreen({ navigation }) {
  const { colors } = useTheme();
  return (
    <LinearGradient colors={colors.bgGradient} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <Header title="About App" showBack onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.logoWrap}>
            <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
              <Ionicons name="book" size={32} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: colors.textPrimary }]}>NovelSpot</Text>
            <Text style={[styles.version, { color: colors.textSecondary }]}>
              Version {appJson.expo.version}
            </Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              NovelSpot is a clean, distraction-free app for reading Urdu novels — online or fully
              offline. Browse by category, save favourites, download novels for offline reading, and
              pick up exactly where you left off.
            </Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary, marginTop: 10 }]}>
              Built with a focus on simplicity: no ads, no login required, and your reading data stays
              on your device.
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
  logoWrap: { alignItems: "center", marginBottom: 20 },
  logoBox: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  appName: { fontSize: 18, fontWeight: "800" },
  version: { fontSize: 12, marginTop: 2 },
  card: { borderRadius: radius.md, padding: 18 },
  paragraph: { fontSize: 13, lineHeight: 20 },
});
