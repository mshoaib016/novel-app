import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import * as KeepAwake from "expo-keep-awake";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import novels from "../data/novels";
import Header from "../components/Header";
import { addBookmark } from "../utils/bookmarks";
import { getLocalUri, pdfUriToDataUri } from "../utils/downloads";
import { logOpen } from "../utils/reading";
import { useTheme } from "../theme/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { translate } from "../i18n/strings";
import { radius } from "../theme/colors";

export default function PdfReaderScreen({ route, navigation }) {
  const { novelId } = route.params;
  const novel = novels.find((n) => n.id === novelId);
  const { colors } = useTheme();
  const { settings } = useSettings();
  const t = (key) => translate(key, settings.language);

  const [pdfSource, setPdfSource] = useState(null);
  const [localFileUri, setLocalFileUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [pageInput, setPageInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  useEffect(() => {
    if (settings.keepScreenOn) {
      KeepAwake.activateKeepAwakeAsync("pdf-reader");
    }
    return () => {
      KeepAwake.deactivateKeepAwake("pdf-reader");
    };
  }, [settings.keepScreenOn]);

  useEffect(() => {
    if (novelId) logOpen(novelId);
  }, [novelId]);

  useEffect(() => {
    let isMounted = true;

    async function resolvePdf() {
      try {
        // Every novel (bundled or remote) must be downloaded first —
        // this is what makes it available offline and what the
        // Download button on the novel's page is for.
        const localUri = await getLocalUri(novelId);
        if (!localUri) {
          if (isMounted) {
            setError("not_downloaded");
            setLoading(false);
          }
          return;
        }

        // Load via base64 data URI — avoids Android WebView's local
        // file:// access restrictions, which otherwise can show a
        // blank white screen for some devices.
        if (isMounted) setLocalFileUri(localUri);
        const dataUri = await pdfUriToDataUri(localUri);
        if (isMounted) {
          setPdfSource(dataUri);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError("load_failed");
          setLoading(false);
        }
      }
    }

    resolvePdf();
    return () => {
      isMounted = false;
    };
  }, [novel, novelId]);

  const onShare = async () => {
    try {
      await Share.share({ message: `I'm reading "${novel?.title}" on Novel Reader!` });
    } catch (e) {}
  };

  const saveBookmark = async () => {
    await addBookmark({
      novelId: novel.id,
      novelTitle: novel.title,
      page: pageInput.trim(),
      note: noteInput.trim(),
    });
    setBookmarkModalVisible(false);
    setPageInput("");
    setNoteInput("");
    Alert.alert(t("bookmarked"), t("bookmarked_msg"));
  };

  const onOpenExternally = async () => {
    if (!localFileUri) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert("Not available", "No app found to open PDFs on this device.");
        return;
      }
      await Sharing.shareAsync(localFileUri, {
        mimeType: "application/pdf",
        dialogTitle: novel?.title || "Open PDF",
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      Alert.alert("Couldn't open", "Please try again.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={["top"]}>
      <Header
        title={novel?.title}
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="share-social-outline"
        onRightPress={onShare}
      />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <LinearGradient colors={colors.bgGradient} style={styles.center}>
          <Ionicons
            name={error === "not_downloaded" ? "cloud-offline-outline" : "alert-circle-outline"}
            size={48}
            color={colors.primary}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            {t("not_available_offline")}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {error === "not_downloaded"
              ? t("download_first_hint")
              : "PDF load nahi ho saki. File check karein."}
          </Text>
          {error === "load_failed" && localFileUri && (
            <TouchableOpacity
              style={[styles.externalBtn, { backgroundColor: colors.primary }]}
              onPress={onOpenExternally}
            >
              <Ionicons name="open-outline" size={16} color="#fff" />
              <Text style={styles.externalBtnText}>Open in PDF App</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      )}

      {!loading && pdfSource && !error && (
        <>
          <WebView
            source={{ uri: pdfSource }}
            style={styles.webview}
            originWhitelist={["*"]}
            startInLoadingState
            onError={() => setError("load_failed")}
            onHttpError={() => setError("load_failed")}
            renderLoading={() => (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.fabSecondary, { backgroundColor: colors.surface, borderColor: colors.glassBorder }]}
            onPress={onOpenExternally}
          >
            <Ionicons name="open-outline" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
            onPress={() => setBookmarkModalVisible(true)}
          >
            <Ionicons name="bookmark" size={22} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={bookmarkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBookmarkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t("bookmark_this_page")}
            </Text>

            <TextInput
              style={[styles.input, { borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder={t("page_number")}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={pageInput}
              onChangeText={setPageInput}
            />
            <TextInput
              style={[styles.input, { borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder={t("note_optional")}
              placeholderTextColor={colors.textMuted}
              value={noteInput}
              onChangeText={setNoteInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setBookmarkModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                onPress={saveBookmark}
              >
                <Text style={styles.modalSaveText}>{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30 },
  emptyTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  fabSecondary: {
    position: "absolute",
    right: 20,
    bottom: 88,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  externalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    marginTop: 16,
  },
  externalBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(20,19,32,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: { width: "100%", borderRadius: radius.lg, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: "800", marginBottom: 14 },
  input: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.sm },
  modalCancelText: { fontWeight: "600" },
  modalSaveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: radius.sm },
  modalSaveText: { color: "#fff", fontWeight: "700" },
});
