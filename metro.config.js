// metro.config.js
// We bundle the pdf.js library and its worker as plain-text assets so the
// built-in reader can render PDFs completely offline. Metro does not treat
// ".txt" as an asset by default, so we register it here. We also register
// ".pdf" so bundled sample novels in assets/pdfs can be require()'d.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'txt', 'pdf'])
);

module.exports = config;
