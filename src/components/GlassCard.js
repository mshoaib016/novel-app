import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { radius } from "../theme/colors";

export default function GlassCard({ children, style }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderColor: colors.glassBorder,
          backgroundColor: colors.glassLight,
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor:
              colors.mode === "dark"
                ? "rgba(255,255,255,0.03)"
                : "rgba(255,255,255,0.2)",
          },
        ]}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
});
