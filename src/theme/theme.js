/**
 * Central design tokens: color palettes (light / dark / sepia), spacing,
 * radii, and typography options. Everything visual references these so the
 * app has one consistent, soft, modern look.
 */

// Soft brand palette — a calm teal/green with warm accents.
const brand = {
  primary: '#0E7C66',
  primaryDark: '#0A5F4E',
  primaryLight: '#2AA88C',
  accent: '#E0A458',
  danger: '#D9534F',
  star: '#F2B01E',
};

export const LIGHT = {
  key: 'light',
  isDark: false,
  ...brand,
  background: '#F5F7F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F0',
  card: '#FFFFFF',
  text: '#16211E',
  textMuted: '#5C6B66',
  textFaint: '#8A9691',
  border: '#E2E8E5',
  overlay: 'rgba(0,0,0,0.45)',
  shadow: '#000000',
  tabBar: '#FFFFFF',
  // reader page colors
  readerBg: '#FFFFFF',
  readerText: '#111111',
};

export const DARK = {
  key: 'dark',
  isDark: true,
  ...brand,
  primary: '#2AA88C',
  background: '#0F1512',
  surface: '#17201C',
  surfaceAlt: '#1E2925',
  card: '#17201C',
  text: '#ECF2EF',
  textMuted: '#A6B3AE',
  textFaint: '#6F7C77',
  border: '#26312C',
  overlay: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
  tabBar: '#141C18',
  readerBg: '#12100E',
  readerText: '#E8E2D6',
};

export const SEPIA = {
  key: 'sepia',
  isDark: false,
  ...brand,
  primary: '#9A6A3A',
  primaryDark: '#7A5026',
  primaryLight: '#B98A57',
  accent: '#B5893C',
  background: '#F3E9D6',
  surface: '#FBF3E3',
  surfaceAlt: '#EFE2C9',
  card: '#FBF3E3',
  text: '#4A3A25',
  textMuted: '#7A6748',
  textFaint: '#9C8A6C',
  border: '#E3D3B3',
  overlay: 'rgba(60,45,25,0.45)',
  shadow: '#3A2C15',
  tabBar: '#FBF3E3',
  readerBg: '#F4ECD8',
  readerText: '#5B4A32',
};

export const PALETTES = { light: LIGHT, dark: DARK, sepia: SEPIA };

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

// Font families available in the reader. "System" is always safe; the named
// families below use bundled/expo fonts if present, otherwise fall back
// gracefully to the platform default. For best Urdu results, add a Nastaliq
// or Naskh font and reference it here.
export const FONT_FAMILIES = [
  { key: 'system', label: 'System Default', labelUrdu: 'سسٹم', family: undefined },
  { key: 'serif', label: 'Serif', labelUrdu: 'سیرف', family: 'serif' },
  { key: 'sans', label: 'Sans', labelUrdu: 'سینز', family: 'sans-serif' },
  { key: 'naskh', label: 'Naskh (Urdu)', labelUrdu: 'نسخ', family: 'NotoNaskhArabic' },
  { key: 'nastaliq', label: 'Nastaliq (Urdu)', labelUrdu: 'نستعلیق', family: 'NotoNastaliqUrdu' },
];

export const FONT_SIZE = { min: 14, max: 34, step: 1, default: 20 };
export const LINE_HEIGHT = { min: 1.2, max: 2.6, step: 0.1, default: 1.9 };
export const PAGE_MARGIN = { min: 8, max: 40, step: 2, default: 18 };

export const TEXT_ALIGN_OPTIONS = [
  { key: 'right', label: 'Right', labelUrdu: 'دائیں', icon: 'text' },
  { key: 'justify', label: 'Justify', labelUrdu: 'برابر', icon: 'reorder-four' },
  { key: 'center', label: 'Center', labelUrdu: 'درمیان', icon: 'text' },
  { key: 'left', label: 'Left', labelUrdu: 'بائیں', icon: 'text' },
];

// Named export used by shadow helpers so cards look soft & elevated.
export function elevation(colors, level = 2) {
  return {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: level },
    shadowOpacity: colors.isDark ? 0.35 : 0.12,
    shadowRadius: level * 3,
    elevation: level + 1,
  };
}
