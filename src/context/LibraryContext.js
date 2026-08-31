import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../storage/keys';
import novels from '../data/novels';

const LibraryContext = createContext(null);

const novelById = (id) => novels.find((n) => n.id === id);

export function LibraryProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([]); // saved novel ids
  const [progress, setProgress] = useState({}); // id -> {page,totalPages,percent,updatedAt}
  const [pageBookmarks, setPageBookmarks] = useState({}); // id -> [pageNumbers]
  const [history, setHistory] = useState([]); // [{id, at}]
  const [loaded, setLoaded] = useState(false);

  const loadedRef = useRef(false);

  // ---- Load everything once -------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const [b, p, pb, h] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.bookmarks),
          AsyncStorage.getItem(STORAGE_KEYS.progress),
          AsyncStorage.getItem(STORAGE_KEYS.pageBookmarks),
          AsyncStorage.getItem(STORAGE_KEYS.history),
        ]);
        if (b) setBookmarks(JSON.parse(b));
        if (p) setProgress(JSON.parse(p));
        if (pb) setPageBookmarks(JSON.parse(pb));
        if (h) setHistory(JSON.parse(h));
      } catch (e) {
        // ignore corrupt storage
      } finally {
        loadedRef.current = true;
        setLoaded(true);
      }
    })();
  }, []);

  // ---- Persist slices -------------------------------------------------------
  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks)).catch(() => {});
  }, [bookmarks]);

  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress)).catch(() => {});
  }, [progress]);

  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEYS.pageBookmarks, JSON.stringify(pageBookmarks)).catch(() => {});
  }, [pageBookmarks]);

  useEffect(() => {
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history)).catch(() => {});
  }, [history]);

  // ---- Bookmarks ------------------------------------------------------------
  const isBookmarked = useCallback((id) => bookmarks.includes(id), [bookmarks]);

  const toggleBookmark = useCallback((id) => {
    setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  // ---- Reading progress & history ------------------------------------------
  const setReadingProgress = useCallback((id, data) => {
    setProgress((prev) => ({
      ...prev,
      [id]: {
        page: data.page ?? prev[id]?.page ?? 1,
        totalPages: data.totalPages ?? prev[id]?.totalPages ?? 0,
        percent: data.percent ?? prev[id]?.percent ?? 0,
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const getProgress = useCallback((id) => progress[id] || null, [progress]);

  const addHistory = useCallback((id) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== id);
      return [{ id, at: new Date().toISOString() }, ...filtered].slice(0, 100);
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  // ---- Page bookmarks (within a novel) -------------------------------------
  const togglePageBookmark = useCallback((id, page) => {
    setPageBookmarks((prev) => {
      const list = prev[id] || [];
      const exists = list.includes(page);
      const nextList = exists ? list.filter((p) => p !== page) : [...list, page].sort((a, b) => a - b);
      return { ...prev, [id]: nextList };
    });
  }, []);

  const getPageBookmarks = useCallback((id) => pageBookmarks[id] || [], [pageBookmarks]);

  // ---- Derived lists for screens -------------------------------------------
  const savedNovels = useMemo(
    () => bookmarks.map(novelById).filter(Boolean),
    [bookmarks]
  );

  const continueReading = useMemo(() => {
    return Object.keys(progress)
      .filter((id) => {
        const p = progress[id];
        return p && p.percent > 0 && p.percent < 100;
      })
      .map((id) => ({ novel: novelById(id), ...progress[id] }))
      .filter((x) => x.novel)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [progress]);

  const historyNovels = useMemo(
    () =>
      history
        .map((h) => ({ novel: novelById(h.id), at: h.at, progress: progress[h.id] }))
        .filter((x) => x.novel),
    [history, progress]
  );

  const value = useMemo(
    () => ({
      loaded,
      // bookmarks
      bookmarks,
      isBookmarked,
      toggleBookmark,
      savedNovels,
      // progress / history
      setReadingProgress,
      getProgress,
      continueReading,
      addHistory,
      clearHistory,
      historyNovels,
      // page bookmarks
      togglePageBookmark,
      getPageBookmarks,
    }),
    [
      loaded,
      bookmarks,
      isBookmarked,
      toggleBookmark,
      savedNovels,
      setReadingProgress,
      getProgress,
      continueReading,
      addHistory,
      clearHistory,
      historyNovels,
      togglePageBookmark,
      getPageBookmarks,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within a LibraryProvider');
  return ctx;
}
