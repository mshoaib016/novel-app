import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const TRACK_WIDTH = 56;
const TRACK_HEIGHT = 32;
const THUMB_SIZE = 26;

/**
 * A modern pill-shaped animated switch used for the Dark Mode toggle.
 * Not the default RN <Switch> — custom-built so it matches the app's
 * glassmorphism / pastel design language.
 */
export default function ThemeToggle({ value, onToggle }) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 60,
    }).start();
  }, [value]);

  const thumbLeft = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, TRACK_WIDTH - THUMB_SIZE - 3],
  });

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.glassBorder, colors.primary],
  });

  return (
    <Pressable onPress={onToggle} hitSlop={8}>
      <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.thumb, { left: thumbLeft }]}>
          <Ionicons
            name={value ? "moon" : "sunny"}
            size={14}
            color={value ? colors.primary : "#F5A623"}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
