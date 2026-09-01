import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import novels from "../data/novels";
import GlassCard from "../components/GlassCard";
import Header from "../components/Header";
import { useTheme } from "../theme/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { translate } from "../i18n/strings";
import { radius } from "../theme/colors";
import { isFavorite, toggleFavorite } from "../utils/bookmarks";
import {
  isDownloaded,
  downloadNovel,
  deleteDownload,
  canDownloadNow,
} from "../utils/downloads";

export default function NovelDetailScreen({ route, navigation }) {
  const { novelId } = route.params;
  const novel = novels.find((n) => n.id === novelId);
  const { colors } = useTheme();
  const { settings } = useSettings();
  const t = (key) => translate(key, settings.language);

  const [fav, setFav] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const isTextNovel = !!novel?.content;
  const hasPdfSource = !!(novel?.pdf || novel?.pdfUrl);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setFav(await isFavorite(novelId));
        if (hasPdfSource) setDownloaded(await isDownloaded(novelId));
      })();
    }, [novelId, hasPdfSource])
  );

  if (!novel) {
    return (
      <View style={styles.center}>
        <Text>Novel not found.</Text>
      </View>
    );
  }

  const accentIndex = novels.findIndex((n) => n.id === novelId);
  const accent = colors.accents[accentIndex % colors.accents.length];

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out "${novel.title}" by ${novel.author} on NovelSpot!`,
      });
    } catch (e) {}
  };

  const onToggleFav = async () => {
    const updated = await toggleFavorite(novelId);
    setFav(updated.includes(novelId));
  };

  const onDownload = async () => {
    if (novel.pdfUrl) {
      const check = await canDownloadNow(settings.wifiOnlyDownloads);
      if (!check.allowed) {
        Alert.alert("Wi-Fi only", check.reason);
        return;
      }
    }
    setDownloading(true);
    setProgress(0);
    try {
      await downloadNovel(novel, setProgress);
      setDownloaded(true);
    } catch (e) {
      Alert.alert("Download failed", "Please check your connection and try again.");
    } finally {
      setDownloading(false);
    }
  };

  const onDeleteDownload = () => {
    Alert.alert("Delete download?", "You'll need to download it again to read.", [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: async () => {
          await deleteDownload(novelId);
          setDownloaded(false);
        },
      },
    ]);
  };

  const onRead = () => {
    if (isTextNovel) {
      navigation.navigate("TextReader", { novelId: novel.id });
    } else {
      navigation.navigate("PdfReader", { novelId: novel.id });
    }
  };

  const canReadNow = isTextNovel || downloaded;

  return (
    <LinearGradient colors={colors.bgGradient} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={["top"]}>
        <Header
          showBack
          onBack={() => navigation.goBack()}
          rightIcon="share-social-outline"
          onRightPress={onShare}
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.coverWrap, { shadowColor: colors.shadow }]}>
            {novel.cover ? (
              <Image source={novel.cover} style={styles.cover} />
            ) : (
              <LinearGradient
                colors={[accent, colors.mode === "dark" ? "#2A2740" : "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coverPlaceholder}
              >
                <Ionicons name="book-outline" size={54} color="#ffffff" />
              </LinearGradient>
            )}

            <TouchableOpacity
              onPress={onToggleFav}
              style={[styles.favBtn, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name={fav ? "bookmark" : "bookmark-outline"}
                size={18}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.infoCard}>
            <View style={styles.infoInner}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{novel.title}</Text>
              <Text style={[styles.author, { color: colors.textSecondary }]}>by {novel.author}</Text>
              {!!novel.category && (
                <View style={[styles.categoryTag, { backgroundColor: colors.primarySoft }]}>
                  <Text style={[styles.categoryTagText, { color: colors.primary }]}>
                    {novel.category}
                  </Text>
                </View>
              )}

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {novel.description || t("no_description")}
              </Text>

              {/* Download row — every PDF novel (bundled or remote) */}
              {hasPdfSource && !downloaded && (
                <TouchableOpacity
                  style={[styles.downloadBtn, { borderColor: colors.primary }]}
                  onPress={onDownload}
                  disabled={downloading}
                >
                  <Ionicons
                    name={downloading ? "cloud-download" : "cloud-download-outline"}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={[styles.downloadBtnText, { color: colors.primary }]}>
                    {downloading ? `${t("downloading")} ${Math.round(progress * 100)}%` : t("download_novel")}
                  </Text>
                </TouchableOpacity>
              )}
              {downloading && (
                <View style={[styles.progressTrack, { backgroundColor: colors.primarySoft }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { backgroundColor: colors.primary, width: `${Math.round(progress * 100)}%` },
                    ]}
                  />
                </View>
              )}
              {hasPdfSource && downloaded && (
                <View style={styles.downloadedRow}>
                  <View style={[styles.downloadedPill, { backgroundColor: colors.primarySoft }]}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <Text style={[styles.downloadedText, { color: colors.primary }]}>
                      {t("downloaded")}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={onDeleteDownload} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.readBtn,
                  { backgroundColor: canReadNow ? colors.primary : colors.textMuted },
                ]}
                onPress={onRead}
                disabled={!canReadNow}
              >
                <Ionicons name="reader-outline" size={18} color="#fff" />
                <Text style={styles.readBtnText}>
                  {canReadNow ? t("read_novel") : t("download_to_read")}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 30, alignItems: "center" },
  coverWrap: {
    width: 180,
    height: 250,
    borderRadius: radius.md,
    overflow: "visible",
    marginBottom: 18,
  },
  cover: { width: "100%", height: "100%", borderRadius: radius.md },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: { width: "100%", borderRadius: radius.lg },
  infoInner: { padding: 18 },
  title: { fontSize: 19, fontWeight: "800", textAlign: "center" },
  author: { fontSize: 13, textAlign: "center", marginTop: 4 },
  categoryTag: {
    alignSelf: "center",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryTagText: { fontSize: 10, fontWeight: "700" },
  description: { fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 12, marginBottom: 14 },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  downloadBtnText: { fontWeight: "700", fontSize: 14 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: { height: "100%", borderRadius: 3 },
  downloadedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  downloadedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  downloadedText: { fontSize: 12, fontWeight: "700" },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: radius.sm,
  },
  readBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
