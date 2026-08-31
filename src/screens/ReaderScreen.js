import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import novels from '../data/novels';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useLibrary } from '../context/LibraryContext';

import buildReaderHtml from '../reader/readerHtml';
import { loadPdfEngine, looksInstalled } from '../reader/pdfjsAssets';
import { getNovelBase64 } from '../utils/novelFile';
import ReaderSettingsSheet from '../reader/ReaderSettingsSheet';
import TextReader from '../reader/TextReader';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import { SPACING } from '../theme/theme';
import { formatPercent } from '../utils/format';

const READER_BG = { light: '#FFFFFF', dark: '#0E0E0E', sepia: '#F4ECD8' };
const READER_FG = { light: '#141414', dark: '#E8E2D6', sepia: '#5B4A32' };

export default function ReaderScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { settings, t } = useSettings();
  const {
    setReadingProgress,
    getProgress,
    addHistory,
    togglePageBookmark,
    getPageBookmarks,
  } = useLibrary();

  const novel = novels.find((n) => n.id === route.params?.id);
  const insets = useSafeAreaInsets();
  const isPdf = !novel || novel.type !== 'text';

  const webRef = useRef(null);
  const savedProgress = useRef(getProgress(novel?.id) || null);
  const latest = useRef({ page: savedProgress.current?.page || 1, total: 0, percent: savedProgress.current?.percent || 0 });
  const lastSave = useRef(0);
  const engineReady = useRef(false);

  const [status, setStatus] = useState('loading'); // loading | ready | error | noEngine
  const [html, setHtml] = useState(null);
  const [base64, setBase64] = useState(null);
  const [page, setPage] = useState(latest.current.page);
  const [total, setTotal] = useState(0);
  const [percent, setPercent] = useState(latest.current.percent);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [zoom, setZoom] = useState(1);

  const readerTheme = settings.readerTheme || 'light';
  const bg = READER_BG[readerTheme];
  const fg = READER_FG[readerTheme];

  // ---- Keep screen awake based on the setting ------------------------------
  useEffect(() => {
    if (settings.keepScreenOn) activateKeepAwakeAsync('reader');
    else deactivateKeepAwake('reader');
    return () => deactivateKeepAwake('reader');
  }, [settings.keepScreenOn]);

  // Screen dimming is handled globally by <BrightnessOverlay /> (see App.js),
  // so the Reader no longer manages hardware brightness directly.

  // ---- Record history + persist final progress on exit ---------------------
  useEffect(() => {
    if (novel) addHistory(novel.id);
    return () => {
      if (novel) {
        setReadingProgress(novel.id, {
          page: latest.current.page,
          totalPages: latest.current.total,
          percent: latest.current.percent,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Prepare the novel (engine text + local file) ------------------------
  useEffect(() => {
    let active = true;
    (async () => {
      if (!novel) {
        setStatus('error');
        return;
      }
      // Text novels don't need the PDF engine.
      if (!isPdf) {
        setStatus('ready');
        return;
      }
      try {
        const engine = await loadPdfEngine();
        if (!looksInstalled(engine)) {
          if (active) setStatus('noEngine');
          return;
        }
        // The novel ships inside the app bundle, so this resolves instantly
        // whether the device is online or offline — no download step needed.
        const data = await getNovelBase64(novel);
        if (!active) return;
        const doc = buildReaderHtml(engine.pdfJsText, engine.workerText, {
          theme: readerTheme,
          zoom,
          mode: settings.readingMode,
        });
        setBase64(data);
        setHtml(doc);
        setStatus('ready');
      } catch (e) {
        if (!active) return;
        setStatus('error');
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Apply live setting changes to the PDF view --------------------------
  useEffect(() => {
    if (!engineReady.current || !webRef.current) return;
    const cmd = `window.__apply(${JSON.stringify({ theme: readerTheme, mode: settings.readingMode, zoom })}); true;`;
    webRef.current.injectJavaScript(cmd);
  }, [readerTheme, settings.readingMode, zoom]);

  const persistProgress = useCallback(
    (p) => {
      latest.current = p;
      const now = Date.now();
      if (now - lastSave.current > 1200) {
        lastSave.current = now;
        setReadingProgress(novel.id, { page: p.page, totalPages: p.total, percent: p.percent });
      }
    },
    [novel, setReadingProgress]
  );

  const onMessage = useCallback(
    (event) => {
      let msg;
      try {
        msg = JSON.parse(event.nativeEvent.data);
      } catch (e) {
        return;
      }
      if (msg.type === 'ready') {
        engineReady.current = true;
        const start = savedProgress.current?.page || 1;
        // Inject the PDF bytes and jump to the last read page.
        webRef.current?.injectJavaScript(`window.__renderPdf("${base64}", ${start}); true;`);
      } else if (msg.type === 'loaded') {
        setTotal(msg.total);
        latest.current.total = msg.total;
      } else if (msg.type === 'progress') {
        setPage(msg.page);
        setTotal(msg.total);
        setPercent(msg.percent);
        persistProgress({ page: msg.page, total: msg.total, percent: msg.percent });
      } else if (msg.type === 'error') {
        setStatus('error');
      }
    },
    [base64, persistProgress]
  );

  const step = (dir) => webRef.current?.injectJavaScript(`window.__step(${dir}); true;`);

  const zoomBy = useCallback((delta) => {
    setZoom((z) => Math.max(0.6, Math.min(2.6, Math.round((z + delta) * 10) / 10)));
  }, []);

  const onTextProgress = useCallback(
    (pct) => {
      setPercent(pct);
      persistProgress({ page: Math.max(1, Math.round((pct / 100) * (novel.pages || 100))), total: novel.pages || 0, percent: pct });
    },
    [novel, persistProgress]
  );

  const pageBookmarks = novel ? getPageBookmarks(novel.id) : [];
  const isPageBookmarked = pageBookmarks.includes(page);

  const headerBar = (
    <View style={[styles.topBar, { paddingTop: insets.top + 6, backgroundColor: bg, borderBottomColor: 'rgba(128,128,128,0.15)' }]}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.iconBtn}>
        <Ionicons name="chevron-back" size={24} color={fg} />
      </Pressable>
      <Text numberOfLines={1} style={[styles.topTitle, { color: fg }]}>
        {novel?.title}
      </Text>
      <View style={styles.topActions}>
        {isPdf ? (
          <Pressable onPress={() => togglePageBookmark(novel.id, page)} hitSlop={10} style={styles.iconBtn}>
            <Ionicons name={isPageBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={isPageBookmarked ? colors.accent : fg} />
          </Pressable>
        ) : null}
        <Pressable onPress={() => setSettingsVisible(true)} hitSlop={10} style={styles.iconBtn}>
          <Text style={[styles.aa, { color: fg }]}>{t('aa')}</Text>
        </Pressable>
      </View>
    </View>
  );

  const bottomBar = (
    <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8, backgroundColor: bg, borderTopColor: 'rgba(128,128,128,0.15)' }]}>
      {isPdf ? (
        <Pressable onPress={() => step(-1)} hitSlop={8} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={22} color={fg} />
        </Pressable>
      ) : null}
      <View style={styles.progressWrap}>
        <Text style={[styles.progressText, { color: fg }]}>
          {isPdf ? `${t('page')} ${page} ${t('of')} ${total || '—'}` : formatPercent(percent)}
        </Text>
        <View style={styles.miniTrack}>
          <View style={[styles.miniFill, { width: `${Math.max(2, percent)}%`, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.progressPct, { color: colors.primary }]}>{formatPercent(percent)}</Text>
      </View>
      {isPdf ? (
        <Pressable onPress={() => step(1)} hitSlop={8} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={22} color={fg} />
        </Pressable>
      ) : null}
      {isPdf ? (
        <>
          <View style={[styles.sep, { backgroundColor: 'rgba(128,128,128,0.25)' }]} />
          <Pressable onPress={() => zoomBy(-0.2)} hitSlop={8} style={styles.navBtn}>
            <Ionicons name="remove-circle-outline" size={22} color={fg} />
          </Pressable>
          <Pressable onPress={() => zoomBy(0.2)} hitSlop={8} style={styles.navBtn}>
            <Ionicons name="add-circle-outline" size={22} color={fg} />
          </Pressable>
        </>
      ) : null}
    </View>
  );

  // ---- Render states -------------------------------------------------------
  const renderBody = () => {
    if (status === 'loading') {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: fg }]}>{t('loadingNovel')}</Text>
        </View>
      );
    }
    if (status === 'noEngine') {
      return (
        <EmptyState
          icon="construct-outline"
          title="Reader engine not installed"
          body="Add pdf.js to assets/pdfjs (see README → One-time setup: pdf.js), then reload the app."
        >
          <Button label={t('done')} onPress={() => navigation.goBack()} />
        </EmptyState>
      );
    }
    if (status === 'error' || !novel) {
      return (
        <EmptyState icon="alert-circle-outline" title={t('readerError')}>
          <Button label={t('done')} onPress={() => navigation.goBack()} />
        </EmptyState>
      );
    }

    // ready
    if (!isPdf) {
      return (
        <TextReader
          content={novel.content || ''}
          initialPercent={savedProgress.current?.percent || 0}
          onProgress={onTextProgress}
        />
      );
    }
    return (
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        mixedContentMode="always"
        androidLayerType={Platform.OS === 'android' ? 'hardware' : undefined}
        style={{ flex: 1, backgroundColor: bg }}
        onError={() => setStatus('error')}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {headerBar}
      <View style={{ flex: 1 }}>{renderBody()}</View>
      {status === 'ready' ? bottomBar : null}
      <ReaderSettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        isPdf={isPdf}
        zoom={zoom}
        onZoomChange={setZoom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    padding: 6,
  },
  topTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: SPACING.sm,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aa: {
    fontSize: 20,
    fontWeight: '800',
    paddingHorizontal: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sep: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    marginHorizontal: 4,
  },
  progressWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  miniTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.25)',
    overflow: 'hidden',
  },
  miniFill: {
    height: 4,
    borderRadius: 2,
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
  },
});
