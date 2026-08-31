import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightColors, darkColors, sepiaColors } from "./colors";

const STORAGE_KEY = "@novel_reader_theme";

// mode: "light" | "dark" | "sepia" | "system"
const PALETTES = { light: lightColors, dark: darkColors, sepia: sepiaColors };

function resolvePalette(mode) {
  if (mode === "system") {
    const sys = Appearance.getColorScheme();
    return sys === "dark" ? darkColors : lightColors;
  }
  return PALETTES[mode] || lightColors;
}

const ThemeContext = createContext({
  mode: "light",
  isDark: false,
  colors: lightColors,
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("light");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setModeState(saved);
      } catch (e) {}
    })();
  }, []);

  const setMode = (next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  // Quick light<->dark toggle used by the Home screen switch
  const toggleTheme = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  const colors = resolvePalette(mode);
  const isDark = colors.mode === "dark";

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
