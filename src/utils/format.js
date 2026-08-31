// Small formatting helpers shared across screens.

export function formatBytes(bytes = 0) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatPercent(p = 0) {
  const clamped = Math.max(0, Math.min(100, Math.round(p)));
  return `${clamped}%`;
}

export function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(iso).toLocaleDateString();
}

// Deterministic soft gradient for a novel cover, derived from its id/title so
// each book keeps the same colors every launch.
const COVER_GRADIENTS = [
  ['#0E7C66', '#2AA88C'],
  ['#6A4C93', '#9A78C7'],
  ['#1D3557', '#457B9D'],
  ['#9A6A3A', '#C79A5B'],
  ['#B23A48', '#D66A76'],
  ['#2B6777', '#52A6B8'],
  ['#3A5A40', '#6B9071'],
  ['#7B506F', '#A97B9A'],
  ['#264653', '#2A9D8F'],
  ['#5F0F40', '#9A2A63'],
];

export function coverColorsFor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  return COVER_GRADIENTS[hash % COVER_GRADIENTS.length];
}
