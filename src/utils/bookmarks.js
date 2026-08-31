import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ================================================================
 * BOOKMARKS UTIL
 * ================================================================
 * Two separate concepts, both stored on-device via AsyncStorage:
 *
 * 1) FAVORITES ("Saved Novels") — a simple novel-level bookmark,
 *    toggled from the novel card or detail screen (like Home).
 *
 * 2) PAGE BOOKMARKS — a specific page/position saved from inside
 *    the PDF reader. Because the WebView PDF viewer can't report
 *    its own page number, the user types it in manually.
 * ================================================================
 */

const FAVORITES_KEY = "@novel_reader_favorites";
const PAGE_BOOKMARKS_KEY = "@novel_reader_bookmarks";

// ---------- Favorites ("Saved Novels") ----------

export async function getFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function isFavorite(novelId) {
  const favs = await getFavorites();
  return favs.includes(novelId);
}

export async function toggleFavorite(novelId) {
  const favs = await getFavorites();
  let updated;
  if (favs.includes(novelId)) {
    updated = favs.filter((id) => id !== novelId);
  } else {
    updated = [novelId, ...favs];
  }
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

// ---------- Page bookmarks (PDF reader) ----------

export async function getBookmarks() {
  try {
    const raw = await AsyncStorage.getItem(PAGE_BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function addBookmark({ novelId, novelTitle, page, note }) {
  const bookmarks = await getBookmarks();
  const newBookmark = {
    id: `${novelId}-${Date.now()}`,
    novelId,
    novelTitle,
    page: page || null,
    note: note || "",
    createdAt: new Date().toISOString(),
  };
  const updated = [newBookmark, ...bookmarks];
  await AsyncStorage.setItem(PAGE_BOOKMARKS_KEY, JSON.stringify(updated));
  return newBookmark;
}

export async function removeBookmark(bookmarkId) {
  const bookmarks = await getBookmarks();
  const updated = bookmarks.filter((b) => b.id !== bookmarkId);
  await AsyncStorage.setItem(PAGE_BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
}
