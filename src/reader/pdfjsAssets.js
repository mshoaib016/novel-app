import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Loads the inlined pdf.js engine + worker (bundled as .txt assets) and caches
 * the text so we only read from disk once per app run.
 *
 * IMPORTANT: place the real pdf.js files here before running the app:
 *   assets/pdfjs/pdf.min.txt         (pdf.js v3 UMD build)
 *   assets/pdfjs/pdf.worker.min.txt  (matching worker)
 * See README.md -> "One-time setup: pdf.js".
 */

let cache = null;

async function readAssetText(assetModule) {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  return FileSystem.readAsStringAsync(uri);
}

export async function loadPdfEngine() {
  if (cache) return cache;
  const [pdfJsText, workerText] = await Promise.all([
    readAssetText(require('../../assets/pdfjs/pdf.min.txt')),
    readAssetText(require('../../assets/pdfjs/pdf.worker.min.txt')),
  ]);
  cache = { pdfJsText, workerText };
  return cache;
}

// Heuristic: the placeholder files are tiny; the real library is hundreds of KB.
export function looksInstalled(engine) {
  return !!engine && engine.pdfJsText && engine.pdfJsText.length > 5000;
}
