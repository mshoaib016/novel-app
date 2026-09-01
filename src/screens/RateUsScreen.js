import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import Header from "../components/Header";
import { useTheme } from "../theme/ThemeContext";
import { radius } from "../theme/colors";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.sourcecodelab.novelreader";
const APP_STORE_URL = "https://apps.apple.com/app/idXXXXXXXXX";

export default function RateUsScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const { colors } = useTheme();

  const openStore = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() => {
      Linking.openURL(APP_STORE_URL);
    });
  };

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <Header title="Rate Us" showBack onBack={() => navigation.goBack()} />

        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <View style={styles.cardInner}>
              <Ionicons name="heart" size={36} color={colors.primary} style={{ marginBottom: 10 }} />
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Enjoying NovelSpot?
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Tap a star and let us know how we're doing.
              </Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => setRating(n)}
                    hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  >
                    <Ionicons
                      name={n <= rating ? "star" : "star-outline"}
                      size={32}
                      color={colors.primary}
                      style={{ marginHorizontal: 3 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.storeBtn, { backgroundColor: colors.primary }]}
                onPress={openStore}
              >
                <Ionicons name="logo-google-playstore" size={18} color="#fff" />
                <Text style={styles.storeBtnText}>Rate on the Store</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    borderRadius: radius.lg,
  },
  cardInner: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  storeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: radius.sm,
  },
  storeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
