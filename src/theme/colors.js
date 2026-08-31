// Palettes: light, dark, sepia. Components read colors via the
// useTheme() hook (src/theme/ThemeContext.js).

export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
};

export const accents = [
  "#C4B5FD",
  "#FBCFE8",
  "#A7F3D0",
  "#FDE68A",
  "#BFDBFE",
  "#FCA5A5",
];

export const lightColors = {
  mode: "light",
  bgGradient: ["#F6F3FD", "#FBF3F0", "#F1F8F5"],
  glassLight: "rgba(255,255,255,0.55)",
  glassBorder: "rgba(255,255,255,0.75)",
  surface: "#FFFFFF",
  inputBorder: "#E5E1F5",
  textPrimary: "#2D2A3D",
  textSecondary: "#6E6A82",
  textMuted: "#9A96AC",
  accents,
  primary: "#8B7FE8",
  primarySoft: "#EDE9FE",
  white: "#FFFFFF",
  shadow: "rgba(139, 127, 232, 0.25)",
};

export const darkColors = {
  mode: "dark",
  bgGradient: ["#181624", "#1E1A2C", "#141320"],
  glassLight: "rgba(255,255,255,0.07)",
  glassBorder: "rgba(255,255,255,0.12)",
  surface: "#211E30",
  inputBorder: "rgba(255,255,255,0.15)",
  textPrimary: "#F3F1FA",
  textSecondary: "#B7B2CC",
  textMuted: "#7C7794",
  accents,
  primary: "#A99CFF",
  primarySoft: "rgba(169,156,255,0.18)",
  white: "#211E30",
  shadow: "rgba(0,0,0,0.55)",
};

export const sepiaColors = {
  mode: "sepia",
  bgGradient: ["#F3E9D3", "#EFE2C7", "#EADCC0"],
  glassLight: "rgba(255,252,240,0.55)",
  glassBorder: "rgba(120,95,55,0.18)",
  surface: "#FBF3E1",
  inputBorder: "rgba(120,95,55,0.25)",
  textPrimary: "#4A3B26",
  textSecondary: "#7A6748",
  textMuted: "#A5906B",
  accents,
  primary: "#9C7A3C",
  primarySoft: "rgba(156,122,60,0.16)",
  white: "#FBF3E1",
  shadow: "rgba(90,70,30,0.3)",
};
