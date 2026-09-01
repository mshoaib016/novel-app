import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

/**
 * Every novel's PDF ships inside the app bundle (require('...')), so it is
 * ALWAYS available, with or without an internet connection. There is no
 * separate "download" step for the user anymore — the app just resolves the
 * bundled file to a local path the first time it's needed and reuses it
 * after that. A `novel.pdf` that is a remote URL is still supported as a
 * fallback (it will be fetched once and cached), so the same code path works
 * whether the app is online or fully offline.
 */

const CACHE_DIR = FileSystem.cacheDirectory + 'novel-cache/';

async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

async function resolveLocalUri(novel) {
  const isRemote = typeof novel.pdf === 'string';

  if (!isRemote) {
    // Bundled asset — resolved straight from the app package, no network needed.
    const asset = Asset.fromModule(novel.pdf);
    await asset.downloadAsync();
    return asset.localUri || asset.uri;
  }

  // Remote URL fallback: fetch once, then reuse the cached copy so it also
  // works offline after the first successful read.
  await ensureCacheDir();
  const dest = `${CACHE_DIR}${novel.id}.pdf`;
  const info = await FileSystem.getInfoAsync(dest);
  if (info.exists && info.size > 0) return dest;
  const result = await FileSystem.downloadAsync(novel.pdf, dest);
  return result.uri;
}

/**
 * Returns a local file:// URI for the novel's PDF, ready for the in-app
 * reader to open directly (pdf.js streams from this path instead of the
 * whole file being converted to base64 and pushed through the JS bridge —
 * much faster and reliable for large scanned novels).
 */
export async function getNovelFileUri(novel) {
  const uri = await resolveLocalUri(novel);
  if (!uri) throw new Error('NOVEL_UNAVAILABLE');
  return uri;
}
