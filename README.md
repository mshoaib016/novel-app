# Urdu Novel Library 📚

A clean, modern **React Native (Expo)** mobile app for reading and collecting Urdu novels — with a built‑in offline PDF reader, full RTL Urdu typography, downloads that persist on‑device, bookmarks, reading progress, and light / dark / sepia themes.

The app ships with **12 preloaded novels** (metadata already wired up in `src/data/novels.js`) and a bottom‑tab layout: **Home · Downloads · Bookmarks · Settings**.

---

## ✨ Features

**Home** — Search, Continue Reading, Featured, Categories, Popular, Recently Added, and a full All‑Novels list. Quick light/dark toggle in the header.

**Novel details** — Cover, title (Urdu + English), author, rating, page count, description, and Bookmark / Share / Download / Read actions with live download status.

**Offline downloads** — A novel’s PDF is saved into the app’s private storage. Once downloaded it opens instantly with **no re‑download**, stays available with **no internet**, shows download progress and a “Downloaded” state, tracks storage used, and can be deleted individually or all at once.

**Built‑in reader** — Renders PDFs fully offline via an inlined **pdf.js** engine inside a WebView (no network, no native PDF module). Supports:
- Right‑to‑left Urdu typography
- Font family, size, line spacing, text alignment, page margins (applied to text‑format novels)
- Light / Dark / Sepia reading themes
- Scroll or page‑by‑page mode, zoom
- Per‑page bookmarks, live reading progress %, and **remembers your exact position**
- Keep‑screen‑awake and optional brightness override

**Bookmarks** — Saved novels, Continue Reading (with progress), and Reading History, each with friendly empty states.

**Settings** — Reading defaults, Appearance (theme + brightness), Library (downloads / history / clear cache / storage), Notifications, General (app language English/اردو, Wi‑Fi‑only downloads), and About (About / Privacy / Terms / Contact / Report / Rate / Share / Version).

Everything (settings, bookmarks, downloads, reading position, history) is stored **locally** and works offline.

---

## ✅ Prerequisites

- **Node.js** 18 LTS or newer
- **npm** (bundled with Node)
- The **Expo Go** app on your phone (iOS App Store / Google Play), **or** an Android emulator / iOS simulator
- `curl` (preinstalled on macOS/Linux and modern Windows) for the one‑time pdf.js step

You do **not** need to install the Expo CLI globally — the commands below use `npx`.

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. Add the pdf.js engine (one-time — see next section)

# 3. Add your real novel PDFs into assets/pdfs/ (optional — placeholders included)

# 4. Start the dev server
npx expo start
```

Then press **a** (Android emulator), **i** (iOS simulator), or scan the QR code with **Expo Go**.

> Tip: if anything caches oddly after adding assets, restart with a clean cache: `npx expo start -c`.

---

## 🔧 One‑time setup: pdf.js

The reader renders PDFs offline by bundling the pdf.js library as **text assets**. Two placeholder files ship in `assets/pdfjs/` — replace them with the real build (v3.11.174) once:

**macOS / Linux**
```bash
curl -L https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.min.js        -o assets/pdfjs/pdf.min.txt
curl -L https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js -o assets/pdfjs/pdf.worker.min.txt
```

**Windows (PowerShell)**
```powershell
curl.exe -L https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.min.js        -o assets/pdfjs/pdf.min.txt
curl.exe -L https://unpkg.com/pdfjs-dist@3.11.174/legacy/build/pdf.worker.min.js -o assets/pdfjs/pdf.worker.min.txt
```

Notes:
- Keep the `.txt` extension — Metro is configured (in `metro.config.js`) to bundle `.txt` (and `.pdf`) as assets so the library can be inlined and run fully offline.
- The **legacy** build is used because it targets older JS engines and is the most compatible inside React Native WebViews.
- Until you replace them, the reader shows a friendly “reader engine not installed” message instead of a PDF — the rest of the app still works.

---

## 📥 Add your novels

The 12 novels are already defined in `src/data/novels.js`. Each entry points at a bundled PDF via `require("../../assets/pdfs/<file>.pdf")`.

To make the project build out of the box, `assets/pdfs/` contains **placeholder PDFs** with the exact expected names. **Replace each placeholder with the real novel PDF, keeping the file name identical** (names are case‑ and space‑sensitive):

```
assets/pdfs/
├─ Namal novel by Nimra Ahmad.pdf
├─ Mirat Ul Uroos By Deputy Nazeer Ahmad.pdf
├─ Sarkash Novel by Mehmood Ahmed Moody.pdf
├─ PEER E KAMIL (P.B.U.H) NOVEL BY UMAIRA AHMED.pdf
├─ RajaGidhbyBanoQudsia.pdf
├─ Udaas Naslain by Abdullah Hussain.pdf
├─ Safreena By Ibn e Naseer.pdf
├─ Manto’s 100 Best Short Stories By Saadat Hasan Manto.pdf
├─ HijaazKiAandhi By Inayatullah Altamash.pdf
├─ Lazat-e-Sang_by_Saadat_Hassan_Manto.pdf
├─ 1947 K MAZALIM KI KAHANI.pdf
└─ Pyar ka Pehla Shehar by Mustansar Hussain Tarar.pdf
```

> The filename for the Manto collection uses a curly apostrophe (’), matching `novels.js`. Copy it exactly.

### Adding more novels

Open `src/data/novels.js` and add an object to the `novels` array. Two ways to supply the file:

```js
// A) Bundled PDF (offline out of the box)
pdf: require("../../assets/pdfs/my-novel.pdf"),

// B) Remote PDF (downloaded on demand, then cached offline)
pdf: "https://example.com/my-novel.pdf",
```

Useful optional fields: `titleUrdu`, `authorUrdu`, `category` (see `CATEGORIES`), `featured`, `popular`, `pages`, `rating`, `dateAdded`, and `cover` (a `require(...)` image or URL). You can also set `type: "text"` and provide a `content` string to use the native reflowable reader instead of a PDF.

---

## 🗂 Project structure

```
urdu-novel-library/
├─ App.js                     # Providers (Settings → Theme → Library) + navigator
├─ index.js                   # Entry (registerRootComponent)
├─ app.json                   # Expo config
├─ metro.config.js            # Registers .txt / .pdf as bundleable assets
├─ babel.config.js
├─ assets/
│  ├─ pdfjs/                   # pdf.min.txt + pdf.worker.min.txt (you add these)
│  └─ pdfs/                    # novel PDFs (placeholders included)
└─ src/
   ├─ data/novels.js          # Novel catalog + CATEGORIES
   ├─ theme/theme.js          # Palettes, spacing, radii, typography tokens
   ├─ i18n/strings.js         # English + Urdu strings
   ├─ storage/keys.js         # AsyncStorage keys
   ├─ utils/                  # format helpers + downloadManager (offline files)
   ├─ context/                # SettingsContext, ThemeContext, LibraryContext
   ├─ components/             # Reusable UI (cards, buttons, rows, sliders…)
   ├─ navigation/             # Bottom tabs + root stack
   ├─ reader/                 # pdf.js WebView engine, text reader, settings sheet
   └─ screens/                # Home, Search, Category, NovelDetails, Downloads,
                              # Bookmarks, Reader, Settings, Info
```

---

## 📴 How offline reading works

1. Tapping **Download** (or **Read** on an undownloaded novel) copies a bundled PDF — or fetches a remote one — into the app’s private document storage via `expo-file-system`.
2. The saved file is reconciled with on‑disk state at launch, so a “Downloaded” novel is never re‑fetched.
3. The reader reads the local file as base64 and hands it to the inlined pdf.js engine inside the WebView — **no network is used at read time**.
4. Your reading position, per‑page bookmarks, and history are written to `AsyncStorage` and restored on next open.

---

## 🔤 Optional: bundle an Urdu font

By default the reader uses the system font (which renders Urdu correctly on most devices). The “Naskh” and “Nastaliq” font options reference `NotoNaskhArabic` / `NotoNastaliqUrdu` and fall back gracefully if those aren’t present.

To bundle a real Nastaliq font:

```bash
npx expo install expo-font
```

Drop a `.ttf` (e.g. `NotoNastaliqUrdu-Regular.ttf`) into `assets/fonts/`, then load it in `App.js`:

```js
import { useFonts } from "expo-font";
// inside App():
const [fontsLoaded] = useFonts({
  NotoNastaliqUrdu: require("./assets/fonts/NotoNastaliqUrdu-Regular.ttf"),
});
if (!fontsLoaded) return null;
```

---

## 🛠 Troubleshooting

- **Reader says “engine not installed.”** You haven’t replaced the pdf.js placeholders — see *One‑time setup: pdf.js*.
- **Metro can’t resolve a `.pdf` / `.txt`.** Make sure `metro.config.js` is present (it registers those extensions) and restart with `npx expo start -c`.
- **A novel shows a blank/sample page.** That novel’s PDF in `assets/pdfs/` is still a placeholder — drop in the real file with the same name.
- **Bundle error: “Unable to resolve …/assets/pdfs/….pdf”.** A filename doesn’t match `novels.js` exactly (spaces, capitals, the curly ’). Rename to match.
- **Very large PDFs feel heavy.** The reader lazy‑renders pages to bound memory; the first open of a big book (e.g. 1000+ pages) may take a moment.

---

## 📦 Tech stack

Expo SDK 51 · React Native 0.74 · React Navigation (native‑stack + bottom‑tabs) · AsyncStorage · expo‑file‑system · react‑native‑webview + pdf.js · expo‑linear‑gradient · @react‑native‑community/slider · expo‑keep‑awake · expo‑brightness · expo‑notifications · expo‑network.

---

## 📄 License & content

App code is provided for your use. Novel texts remain the property of their respective authors and publishers — please ensure you have the right to distribute any PDF you add.
