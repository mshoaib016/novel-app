import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as KeepAwake from "expo-keep-awake";
import { Ionicons } from "@expo/vector-icons";
import novels from "../data/novels";
import Header from "../components/Header";
import { useTheme } from "../theme/ThemeContext";
import { useSettings, FONT_FAMILIES } from "../context/SettingsContext";
import { addBookmark } from "../utils/bookmarks";
import { logOpen, setProgress, getProgress } from "../utils/reading";
import { radius } from "../theme/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;

function fontFamilyToStyle(id) {
  if (id === "serif") return "serif";
  if (id === "monospace") return "monospace";
  return undefined; // system default
}

export default function TextReaderScreen({ route, navigation }) {
  const { novelId } = route.params;
  const novel = novels.find((n) => n.id === novelId);
  const { colors } = useTheme();
  const { settings } = useSettings();

  const pages = useMemo(() => {
    if (!novel?.content) return [];
    // Simple pagination: split on blank lines (paragraphs/chapters)
    return novel.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }, [novel]);

  const [pageIndex, setPageIndex] = useState(0);
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const listRef = useRef(null);
  const scrollRef = useRef(null);
  const restoredRef = useRef(false);

  const isRTL = settings.rtlText;
  const isPageMode = settings.readingMode === "page";

  useEffect(() => {
    if (settings.keepScreenOn) {
      KeepAwake.activateKeepAwakeAsync("text-reader");
    }
    return () => KeepAwake.deactivateKeepAwake("text-reader");
  }, [settings.keepScreenOn]);

  useEffect(() => {
    if (novelId) logOpen(novelId);
  }, [novelId]);

  // Restore last position once
  useEffect(() => {
    (async () => {
      const prog = await getProgress(novelId);
      if (prog?.pageIndex != null && !restoredRef.current) {
        restoredRef.current = true;
        setPageIndex(Math.min(prog.pageIndex, Math.max(0, pages.length - 1)));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novelId, pages.length]);

  useEffect(() => {
    if (isPageMode && listRef.current && pages.length) {
      listRef.current.scrollToIndex({ index: pageIndex, animated: false });
    }
  }, [isPageMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveProgress = (idx) => {
    setProgress(novelId, { pageIndex: idx, totalPages: pages.length || 1 });
  };

  const goNext = () => {
    const next = Math.min(pageIndex + 1, pages.length - 1);
    setPageIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
    saveProgress(next);
  };
  const goPrev = () => {
    const prev = Math.max(pageIndex - 1, 0);
    setPageIndex(prev);
    listRef.current?.scrollToIndex({ index: prev, animated: true });
    saveProgress(prev);
  };

  const onShare = async () => {
    try {
      await Share.share({ message: `I'm reading "${novel?.title}" on Novel Reader!` });
    } catch (e) {}
  };

  const saveBookmark = async () => {
    await addBookmark({
      novelId,
      novelTitle: novel.title,
      page: String(pageIndex + 1),
      note: noteInput.trim(),
    });
    saveProgress(pageIndex);
    setBookmarkModalVisible(false);
    setNoteInput("");
    Alert.alert("Bookmarked", "Your reading spot has been saved.");
  };

  if (!novel || !pages.length) {
    return (
      <View style={styles.center}>
        <Text>No content available.</Text>
      </View>
    );
  }

  const textStyle = {
    fontFamily: fontFamilyToStyle(settings.fontFamily),
    fontSize: settings.fontSize,
    lineHeight: settings.fontSize * settings.lineSpacing,
    textAlign: settings.textAlign,
    writingDirection: isRTL ? "rtl" : "ltr",
    color: colors.textPrimary,
  };

  const percent = Math.round(((pageIndex + 1) / pages.length) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]} edges={["top"]}>
      <Header
        title={novel.title}
        subtitle={`${percent}% · Page ${pageIndex + 1} of ${pages.length}`}
        showBack
        onBack={() => navigation.goBack()}
        rightIcon="share-social-outline"
        onRightPress={onShare}
      />

      {isPageMode ? (
        <FlatList
          ref={listRef}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          initialScrollIndex={pageIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setPageIndex(idx);
            saveProgress(idx);
          }}
          renderItem={({ item }) => (
            <ScrollView
              style={{ width: SCREEN_WIDTH }}
              contentContainerStyle={{ padding: settings.pageMargin }}
            >
              <Text style={textStyle}>{item}</Text>
            </ScrollView>
          )}
        />
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: settings.pageMargin }}
          onScroll={(e) => {
            const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
            const maxScroll = contentSize.height - layoutMeasurement.height;
            if (maxScroll > 0) {
              const ratio = contentOffset.y / maxScroll;
              const idx = Math.min(pages.length - 1, Math.round(ratio * (pages.length - 1)));
              setPageIndex(idx);
            }
          }}
          onMomentumScrollEnd={() => saveProgress(pageIndex)}
          scrollEventThrottle={200}
        >
          {pages.map((p, i) => (
            <Text key={i} style={[textStyle, { marginBottom: settings.fontSize }]}>
              {p}
            </Text>
          ))}
        </ScrollView>
      )}

      {isPageMode && (
        <View style={[styles.navBar, { backgroundColor: colors.surface, borderTopColor: colors.glassBorder }]}>
          <TouchableOpacity onPress={goPrev} disabled={pageIndex === 0} style={styles.navArrow}>
            <Ionicons
              name="chevron-back"
              size={22}
              color={pageIndex === 0 ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.navProgress, { color: colors.textSecondary }]}>
            {pageIndex + 1} / {pages.length}
          </Text>
          <TouchableOpacity
            onPress={goNext}
            disabled={pageIndex === pages.length - 1}
            style={styles.navArrow}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={pageIndex === pages.length - 1 ? colors.textMuted : colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
        onPress={() => setBookmarkModalVisible(true)}
      >
        <Ionicons name="bookmark" size={22} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={bookmarkModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBookmarkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Bookmark page {pageIndex + 1}
            </Text>
            <TextInput
              style={[styles.input, { borderColor: colors.inputBorder, color: colors.textPrimary }]}
              placeholder="Note (optional)"
              placeholderTextColor={colors.textMuted}
              value={noteInput}
              onChangeText={setNoteInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setBookmarkModalVisible(false)}>
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]}
                onPress={saveBookmark}
              >
                <Text style={styles.modalSaveText}>Save</Text>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  navArrow: { padding: 8 },
  navProgress: { fontSize: 13, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 84,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
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
