import * as FileSystem from "expo-file-system/legacy";
import * as Network from "expo-network";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ================================================================
 * DOWNLOAD & OFFLINE SYSTEM
 * ================================================================
 * Every novel that has a PDF (bundled via require() OR remote via
 * a URL) goes through the SAME download flow, so each novel has
 * its own independent Download button and the user controls
 * exactly which novels take up storage:
 *
 * 1) novel.pdf (require(...))  — the file ships inside the app,
 *    but is NOT copied into readable local storage until the user
 *    taps Download. This copy is fast (no network needed) but still
 *    gives the user full control: per-novel download, delete,
 *    storage tracking — exactly like a real download.
 *
 * 2) novel.pdfUrl ("https://...") — a real network download with
 *    live progress, for novels not bundled in the app at all.
 *
 * Both end up stored the same way: a local copy in the app's own
 * documents folder, tracked in AsyncStorage metadata.
 * ================================================================
 */

const DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";
const META_KEY = "@novel_reader_downloads_meta";

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

async function getMeta() {
  try {
    const raw = await AsyncStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

async function setMeta(meta) {
  await AsyncStorage.setItem(META_KEY, JSON.stringify(meta));
}

export async function getDownloadedMap() {
  return getMeta();
}

export async function isDownloaded(novelId) {
  const meta = await getMeta();
  return !!meta[novelId];
}

export async function getLocalUri(novelId) {
  const meta = await getMeta();
  return meta[novelId]?.localUri || null;
}

/** Checks the Wi-Fi-only preference against the current connection. */
export async function canDownloadNow(wifiOnly) {
  if (!wifiOnly) return { allowed: true };
  try {
    const state = await Network.getNetworkStateAsync();
    if (state.type === Network.NetworkStateType.WIFI) return { allowed: true };
    return {
      allowed: false,
      reason:
        "Wi-Fi-only downloads is turned on in Settings, and you're not on Wi-Fi right now.",
    };
  } catch (e) {
    return { allowed: true };
  }
}

/**
 * Downloads/copies a novel's PDF into local storage, reporting
 * progress 0..1. Works for both bundled (require) and remote (URL)
 * novels. Returns { localUri, sizeBytes } on success.
 */
export async function downloadNovel(novel, onProgress) {
  await ensureDir();
  const dest = `${DOWNLOAD_DIR}${novel.id}.pdf`;

  let finalUri;

  if (novel.pdfUrl) {
    // Real network download with live progress
    const resumable = FileSystem.createDownloadResumable(
      novel.pdfUrl,
      dest,
      {},
      (progressEvent) => {
        if (progressEvent.totalBytesExpectedToWrite > 0) {
          onProgress?.(
            progressEvent.totalBytesWritten /
              progressEvent.totalBytesExpectedToWrite
          );
        }
      }
    );
    const result = await resumable.downloadAsync();
    if (!result?.uri) throw new Error("Download failed");
    finalUri = result.uri;
  } else if (novel.pdf) {
    // Bundled asset — resolve it, then copy into the downloads folder
    onProgress?.(0.15);
    const asset = Asset.fromModule(novel.pdf);
    await asset.downloadAsync();
    onProgress?.(0.6);
    const sourceUri = asset.localUri || asset.uri;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    onProgress?.(1);
    finalUri = dest;
  } else {
    throw new Error("This novel has no PDF source.");
  }

  const info = await FileSystem.getInfoAsync(finalUri, { size: true });

  const meta = await getMeta();
  meta[novel.id] = {
    localUri: finalUri,
    sizeBytes: info.size || 0,
    downloadedAt: new Date().toISOString(),
    title: novel.title,
    author: novel.author,
  };
  await setMeta(meta);

  return { localUri: finalUri, sizeBytes: info.size || 0 };
}

export async function deleteDownload(novelId) {
  const meta = await getMeta();
  const entry = meta[novelId];
  if (entry?.localUri) {
    try {
      await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
    } catch (e) {
      // ignore, still clear metadata below
    }
  }
  delete meta[novelId];
  await setMeta(meta);
}

export async function getTotalStorageUsed() {
  const meta = await getMeta();
  return Object.values(meta).reduce((sum, m) => sum + (m.sizeBytes || 0), 0);
}

export function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb.toFixed(1)} MB`;
}

/**
 * Converts a local file:// PDF into a base64 data: URI. Android's
 * WebView sometimes shows a blank white screen when loading a PDF
 * straight from file:// (its built-in PDF viewer plugin can silently
 * fail to render local files), so we embed the file directly as a
 * data URI instead — this avoids file-access edge cases entirely.
 */
export async function pdfUriToDataUri(localUri) {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:application/pdf;base64,${base64}`;
}
