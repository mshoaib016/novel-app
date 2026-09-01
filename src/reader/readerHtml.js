/**
 * Builds the self-contained HTML document that renders a PDF inside a WebView,
 * fully offline. pdf.js and its worker are inlined (their text is passed in
 * from bundled assets), so no network access is ever required.
 *
 * Communication protocol
 *   WebView -> RN (window.ReactNativeWebView.postMessage, JSON):
 *     { type: 'ready' }                        engine loaded, awaiting PDF
 *     { type: 'loaded', total }                PDF parsed, page count known
 *     { type: 'progress', page, total, percent }
 *     { type: 'error', message }
 *   RN -> WebView (webref.injectJavaScript):
 *     window.__renderPdf(fileUrl, startPage)
 *     window.__apply({ theme, zoom, mode })
 *     window.__go(pageNumber)
 *     window.__step(+1 | -1)
 */

// Guard so inlined library text can never prematurely close the <script> tag.
function guard(text) {
  return String(text).replace(/<\/script>/gi, '<\\/script>');
}

export default function buildReaderHtml(pdfJsText, workerText, options = {}) {
  const { theme = 'light', zoom = 1, mode = 'scroll' } = options;

  const themes = {
    light: { bg: '#FFFFFF', page: '#FFFFFF', filter: 'none' },
    dark: { bg: '#0E0E0E', page: '#0E0E0E', filter: 'invert(1) hue-rotate(180deg)' },
    sepia: { bg: '#F4ECD8', page: '#F4ECD8', filter: 'sepia(0.45) contrast(0.95) brightness(0.97)' },
  };

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
  html, body { margin:0; padding:0; height:100%; background:${themes[theme].bg}; -webkit-user-select:none; user-select:none; }
  #viewer { width:100%; height:100%; overflow-y:auto; -webkit-overflow-scrolling:touch; background:${themes[theme].bg}; }
  .page { position:relative; margin:0 auto; background:#fff; box-shadow:0 2px 12px rgba(0,0,0,0.18); }
  #viewer.paged { overflow:hidden; display:flex; align-items:center; justify-content:center; touch-action:pan-y; }
  #viewer.paged .page { box-shadow:none; background:${themes[theme].bg}; }
  canvas { display:block; width:100%; height:100%; }
  #spinner { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); color:#888; font-family:sans-serif; font-size:14px; }
</style>
</head>
<body>
<div id="spinner">…</div>
<div id="viewer" class="${mode}"></div>

<!-- pdf.js engine (inlined, executed) -->
<script>${guard(pdfJsText)}</script>

<!-- pdf.js worker source (inlined as raw text, turned into a Blob worker) -->
<script type="text/plain" id="pdf-worker-src">${guard(workerText)}</script>

<script>
(function () {
  var THEMES = ${JSON.stringify(themes)};
  var post = function (obj) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(obj));
  };

  // Resolve pdf.js global (v3 exposes pdfjsLib).
  var pdfjsLib = window.pdfjsLib || (window.pdfjsDistBuildPdf ? window.pdfjsDistBuildPdf : null);
  try {
    var workerText = document.getElementById('pdf-worker-src').textContent;
    var blob = new Blob([workerText], { type: 'application/javascript' });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
  } catch (e) {
    post({ type: 'error', message: 'worker-init: ' + e.message });
  }

  var viewer = document.getElementById('viewer');
  var state = {
    doc: null,
    total: 0,
    current: 1,
    fitScale: 1,
    zoom: ${zoom},
    mode: '${mode}',
    theme: '${theme}',
    rendered: {},       // pageNumber -> canvas element (scroll mode)
    pageHeight: 0,
    pageDivs: [],
    rendering: {},
    spread: false,       // true if source PDF pages are 2-up scanned spreads
    realTotal: 0,        // actual PDF page count (before splitting spreads)
  };

  // A "virtual" page is what the reader shows as one page. When the source
  // PDF is a 2-up scanned spread (very common for scanned Urdu novels),
  // every real PDF page becomes 2 virtual pages so the user reads one clean,
  // readable page at a time instead of a tiny cramped spread. Urdu books are
  // right-to-left, so the right half of a spread is read before the left.
  function virtualToReal(v) {
    if (!state.spread) return { real: v, half: 'full' };
    var real = Math.ceil(v / 2);
    var half = (v % 2 === 1) ? 'right' : 'left';
    return { real: real, half: half };
  }

  function applyThemeStyles() {
    var th = THEMES[state.theme] || THEMES.light;
    document.body.style.background = th.bg;
    viewer.style.background = th.bg;
    viewer.style.filter = th.filter;
  }

  function effectiveScale() { return state.fitScale * state.zoom; }

  // Renders one PDF page into a canvas, cropping to just one half when the
  // source PDF page is a scanned two-page spread (see virtualToReal above).
  function renderInto(canvas, page, half) {
    var scale = effectiveScale() * (window.devicePixelRatio || 1);
    var vp = page.getViewport({ scale: scale });
    var fullW = vp.width, fullH = vp.height;
    var halfW = (state.spread && half !== 'full') ? fullW / 2 : fullW;
    canvas.width = halfW;
    canvas.height = fullH;
    var ctx = canvas.getContext('2d');
    if (half === 'right') ctx.translate(-halfW, 0);
    return page.render({ canvasContext: ctx, viewport: vp }).promise;
  }

  // ---- Scroll (continuous) mode with lazy rendering ----------------------
  function buildScrollSkeleton() {
    viewer.innerHTML = '';
    state.rendered = {};
    state.pageDivs = [];
    for (var i = 1; i <= state.total; i++) {
      var d = document.createElement('div');
      d.className = 'page';
      d.setAttribute('data-page', i);
      d.style.height = state.pageHeight + 'px';
      d.style.width = state.pageWidth + 'px';
      d.style.marginTop = (i === 1 ? 12 : 10) + 'px';
      d.style.marginBottom = '10px';
      viewer.appendChild(d);
      state.pageDivs.push(d);
    }
  }

  function renderPageInto(div, num) {
    if (state.rendering[num] || div.querySelector('canvas')) return;
    state.rendering[num] = true;
    var meta = virtualToReal(num);
    state.doc.getPage(meta.real).then(function (page) {
      var canvas = document.createElement('canvas');
      div.appendChild(canvas);
      renderInto(canvas, page, meta.half).then(function () {
        state.rendering[num] = false;
      });
    }).catch(function () { state.rendering[num] = false; });
  }

  function updateVisibleScroll() {
    if (state.mode !== 'scroll' || !state.total) return;
    var scrollTop = viewer.scrollTop;
    var vh = viewer.clientHeight;
    var unit = state.pageHeight + 10;
    var first = Math.max(1, Math.floor(scrollTop / unit) - 1);
    var last = Math.min(state.total, Math.ceil((scrollTop + vh) / unit) + 1);
    for (var i = first; i <= last; i++) renderPageInto(state.pageDivs[i - 1], i);
    // Unload far pages to bound memory.
    Object.keys(state.rendering);
    for (var j = 1; j <= state.total; j++) {
      if (j < first - 2 || j > last + 2) {
        var dv = state.pageDivs[j - 1];
        var c = dv && dv.querySelector('canvas');
        if (c) dv.removeChild(c);
      }
    }
    var newCurrent = Math.min(state.total, Math.max(1, Math.round(scrollTop / unit) + 1));
    if (newCurrent !== state.current) {
      state.current = newCurrent;
      reportProgress();
    }
  }

  // ---- Paged mode --------------------------------------------------------
  function renderPagedCurrent() {
    viewer.innerHTML = '';
    var div = document.createElement('div');
    div.className = 'page';
    viewer.appendChild(div);
    var meta = virtualToReal(state.current);
    state.doc.getPage(meta.real).then(function (page) {
      var canvas = document.createElement('canvas');
      div.appendChild(canvas);
      var dpr = window.devicePixelRatio || 1;
      renderInto(canvas, page, meta.half).then(function () {
        div.style.width = (canvas.width / dpr) + 'px';
        div.style.height = (canvas.height / dpr) + 'px';
        reportProgress();
      });
    });
  }

  function reportProgress() {
    var percent = state.total ? Math.round((state.current / state.total) * 100) : 0;
    post({ type: 'progress', page: state.current, total: state.total, percent: percent });
  }

  function computeFit(page) {
    var containerWidth = viewer.clientWidth - 8;
    var vp1 = page.getViewport({ scale: 1 });
    var unitWidth = state.spread ? vp1.width / 2 : vp1.width;
    state.fitScale = containerWidth / unitWidth;
    state.pageWidth = Math.floor(unitWidth * effectiveScale());
    state.pageHeight = Math.floor(vp1.height * effectiveScale());
  }

  function layout(startPage) {
    if (state.mode === 'scroll') {
      buildScrollSkeleton();
      if (startPage && startPage > 1) {
        viewer.scrollTop = (startPage - 1) * (state.pageHeight + 10);
      }
      updateVisibleScroll();
    } else {
      renderPagedCurrent();
    }
    reportProgress();
  }

  viewer.addEventListener('scroll', function () {
    window.requestAnimationFrame(updateVisibleScroll);
  });

  // ---- Swipe gestures (paged mode) — swipe left/right like flipping
  //      through photos, in addition to the RN-side prev/next buttons. ----
  (function () {
    var touchStartX = 0, touchStartY = 0, touchActive = false;
    var SWIPE_THRESHOLD = 40;

    viewer.addEventListener('touchstart', function (e) {
      if (state.mode !== 'paged' || !e.touches || e.touches.length !== 1) return;
      touchActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    viewer.addEventListener('touchend', function (e) {
      if (state.mode !== 'paged' || !touchActive) return;
      touchActive = false;
      var t = (e.changedTouches && e.changedTouches[0]) || null;
      if (!t) return;
      var dx = t.clientX - touchStartX;
      var dy = t.clientY - touchStartY;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
        // Swipe right-to-left -> next page; left-to-right -> previous page.
        window.__step(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  })();

  // Loads a local file:// PDF as raw bytes via XHR (more reliable across
  // WebView versions than fetch() for file:// URLs).
  function loadFileBytes(url, onOk, onErr) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        if (xhr.status === 0 || xhr.status === 200) onOk(xhr.response);
        else onErr('status ' + xhr.status);
      };
      xhr.onerror = function () { onErr('xhr error'); };
      xhr.send();
    } catch (e) {
      onErr(e && e.message ? e.message : 'xhr threw');
    }
  }

  // ---- Public API called from React Native -------------------------------
  // The "url" argument is a local file:// path to the PDF. The file is read
  // directly off disk inside the WebView instead of being base64-encoded
  // and pushed through the JS bridge — much faster and reliable for large
  // scanned novels.
  window.__renderPdf = function (url, startPage) {
    if (!pdfjsLib) { post({ type: 'error', message: 'pdfjs-missing' }); return; }
    loadFileBytes(url, function (buf) {
      renderFromBytes(new Uint8Array(buf), startPage);
    }, function (err) {
      post({ type: 'error', message: 'read: ' + err });
    });
  };

  function renderFromBytes(bytes, startPage) {
    var task = pdfjsLib.getDocument({ data: bytes });
    task.promise.then(function (doc) {
      state.doc = doc;
      document.getElementById('spinner').style.display = 'none';
      doc.getPage(1).then(function (page) {
        // Detect scanned two-page spreads: a page much wider than it is
        // tall is almost certainly two facing book pages in one image.
        var vp1 = page.getViewport({ scale: 1 });
        state.spread = (vp1.width / vp1.height) > 1.25;
        state.realTotal = doc.numPages;
        state.total = state.spread ? doc.numPages * 2 : doc.numPages;
        state.current = Math.min(Math.max(1, startPage || 1), state.total);
        computeFit(page);
        applyThemeStyles();
        post({ type: 'loaded', total: state.total });
        layout(state.current);
      });
    }).catch(function (e) {
      post({ type: 'error', message: 'open: ' + (e && e.message ? e.message : 'failed') });
    });
  }

  window.__apply = function (opts) {
    var needRelayout = false;
    if (opts.theme && opts.theme !== state.theme) { state.theme = opts.theme; applyThemeStyles(); }
    if (typeof opts.zoom === 'number' && opts.zoom !== state.zoom) { state.zoom = opts.zoom; needRelayout = true; }
    if (opts.mode && opts.mode !== state.mode) {
      state.mode = opts.mode;
      viewer.className = state.mode;
      needRelayout = true;
    }
    if (needRelayout && state.doc) {
      state.doc.getPage(1).then(function (page) { computeFit(page); layout(state.current); });
    }
  };

  window.__go = function (page) {
    if (!state.doc) return;
    state.current = Math.min(Math.max(1, page), state.total);
    if (state.mode === 'scroll') {
      viewer.scrollTop = (state.current - 1) * (state.pageHeight + 10);
      updateVisibleScroll();
    } else {
      renderPagedCurrent();
    }
    reportProgress();
  };

  window.__step = function (dir) { window.__go(state.current + dir); };

  post({ type: 'ready' });
})();
</script>
</body>
</html>`;
}
