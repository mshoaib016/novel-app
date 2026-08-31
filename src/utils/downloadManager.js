import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import * as Network from 'expo-network';

import { NOVEL_DIR_NAME } from '../storage/keys';

/**
 * Download / offline manager.
 *
 * Responsibilities:
 *  - Keep a dedicated folder inside the app sandbox for downloaded novels.
 *  - Copy a bundled (require'd) PDF OR fetch a remote PDF into that folder.
 *  - Report progress, report final size, and support deletion.
 *
 * Everything here writes to FileSystem.documentDirectory, which persists
 * across app restarts and is available with no internet connection.
 */

const DIR = FileSystem.documentDirectory + NOVEL_DIR_NAME + '/';

export async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
  }
  return DIR;
}

export function localUriFor(id) {
  return `${DIR}${id}.pdf`;
}

export async function isDownloaded(id) {
  try {
    const info = await FileSystem.getInfoAsync(localUriFor(id));
    return info.exists && info.size > 0;
  } catch (e) {
    return false;
  }
}

export async function fileSize(uri) {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return info.exists ? info.size || 0 : 0;
  } catch (e) {
    return 0;
  }
}

export async function totalStorageUsed(ids = []) {
  let total = 0;
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    total += await fileSize(localUriFor(id));
  }
  return total;
}

async function assertNetworkAllowed(wifiOnly) {
  const state = await Network.getNetworkStateAsync();
  if (!state.isConnected) {
    // A bundled (require'd) asset does not truly need the network, but remote
    // URLs do. The caller decides; we only guard the Wi-Fi-only rule here.
    return { connected: false, type: state.type };
  }
  if (wifiOnly && state.type !== Network.NetworkStateType.WIFI) {
    const err = new Error('WIFI_ONLY');
    err.code = 'WIFI_ONLY';
    throw err;
  }
  return { connected: true, type: state.type };
}

/**
 * Download a single novel to local storage.
 * @param {object} novel  novel record (must have id and pdf)
 * @param {object} opts   { wifiOnly, onProgress(fraction 0..1) }
 * @returns {Promise<{uri:string,size:number}>}
 */
export async function downloadNovel(novel, opts = {}) {
  const { wifiOnly = false, onProgress } = opts;
  await ensureDir();
  const dest = localUriFor(novel.id);
  const isRemote = typeof novel.pdf === 'string';

  // Wi-Fi-only only matters when we actually hit the network.
  if (isRemote) {
    await assertNetworkAllowed(wifiOnly);
  }

  if (isRemote) {
    const resumable = FileSystem.createDownloadResumable(
      novel.pdf,
      dest,
      {},
      (p) => {
        if (onProgress && p.totalBytesExpectedToWrite > 0) {
          onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
        }
      }
    );
    const result = await resumable.downloadAsync();
    if (!result || !result.uri) throw new Error('DOWNLOAD_FAILED');
    const size = await fileSize(result.uri);
    if (onProgress) onProgress(1);
    return { uri: result.uri, size };
  }

  // Bundled asset (require'd). Resolve it to a local file, then copy into our
  // managed folder so it behaves exactly like a downloaded novel.
  const asset = Asset.fromModule(novel.pdf);
  if (onProgress) onProgress(0.15);
  await asset.downloadAsync();
  if (onProgress) onProgress(0.55);
  const src = asset.localUri || asset.uri;
  if (!src) throw new Error('DOWNLOAD_FAILED');

  // Remove any stale copy first.
  try {
    const existing = await FileSystem.getInfoAsync(dest);
    if (existing.exists) {
      await FileSystem.deleteAsync(dest, { idempotent: true });
    }
  } catch (e) {
    // ignore — a fresh copy follows
  }

  // Primary path: a straight file copy (fast, low memory).
  try {
    await FileSystem.copyAsync({ from: src, to: dest });
  } catch (copyErr) {
    // Fallback: some bundled URIs (file names with spaces / non-ASCII, or
    // content:// sources) don't copy cleanly. Re-encode through base64 into
    // our clean destination path so the novel always lands on disk.
    const b64 = await FileSystem.readAsStringAsync(src, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(dest, b64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }
  if (onProgress) onProgress(0.9);
  const size = await fileSize(dest);
  if (!size) throw new Error('DOWNLOAD_FAILED');
  if (onProgress) onProgress(1);
  return { uri: dest, size };
}

export async function deleteNovel(id) {
  try {
    await FileSystem.deleteAsync(localUriFor(id), { idempotent: true });
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteAll(ids = []) {
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    await deleteNovel(id);
  }
}

/**
 * Read a locally stored PDF as base64 so it can be handed to the in-app
 * pdf.js reader without any network access.
 */
export async function readNovelBase64(id) {
  const uri = localUriFor(id);
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) throw new Error('NOT_DOWNLOADED');
  return FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}
