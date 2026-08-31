import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ================================================================
 * READING HISTORY / "CONTINUE READING" / PROGRESS
 * ================================================================
 * Tracks, per novel: when it was last opened, and (for the plain
 * text reader) the exact page index the user was on. This powers
 * the Home screen's "Continue Reading" row and the Bookmarks
 * screen's reading history.
 *
 * Note: for PDF novels, the built-in PDF viewer (a WebView) does
 * not expose a reliable "current page" API, so PDF progress relies
 * on the page number the user manually bookmarks in the reader
 * (see utils/bookmarks.js). For plain-text novels, position/percent
 * is tracked automatically and precisely.
 * ================================================================
 */

const KEY = "@novel_reader_history";

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

async function save(history) {
  await AsyncStorage.setItem(KEY, JSON.stringify(history));
}

export async function logOpen(novelId) {
  const history = await getHistory();
  history[novelId] = {
    ...(history[novelId] || {}),
    lastOpenedAt: new Date().toISOString(),
  };
  await save(history);
}

export async function setProgress(novelId, { pageIndex, totalPages }) {
  const history = await getHistory();
  const percent =
    totalPages > 0 ? Math.round(((pageIndex + 1) / totalPages) * 100) : null;
  history[novelId] = {
    ...(history[novelId] || {}),
    lastOpenedAt: new Date().toISOString(),
    pageIndex,
    totalPages,
    percent,
  };
  await save(history);
}

export async function getProgress(novelId) {
  const history = await getHistory();
  return history[novelId] || null;
}

/** Sorted most-recent-first list of { novelId, ...entry } */
export async function getRecentlyOpened() {
  const history = await getHistory();
  return Object.entries(history)
    .map(([novelId, entry]) => ({ novelId, ...entry }))
    .filter((e) => !!e.lastOpenedAt)
    .sort((a, b) => new Date(b.lastOpenedAt) - new Date(a.lastOpenedAt));
}

export async function removeHistoryEntry(novelId) {
  const history = await getHistory();
  delete history[novelId];
  await save(history);
}

export async function clearHistory() {
  await AsyncStorage.removeItem(KEY);
}

/** Removes a single novel from the reading history / Continue Reading list. */
export async function removeFromHistory(novelId) {
  const history = await getHistory();
  delete history[novelId];
  await save(history);
}
