import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

import { useTheme } from '../context/ThemeContext';

/**
 * Thin rounded progress bar. `progress` is 0..1.
 * The fill width is animated so it glides smoothly between values — the
 * download card's bar visibly "runs" as progress updates.
 */
export default function ProgressBar({ progress = 0, height = 6, color, trackColor, style }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  const anim = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width (percentage) can't use the native driver
    }).start();
  }, [pct, anim]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height, backgroundColor: trackColor || colors.surfaceAlt },
        style,
      ]}
    >
      <Animated.View
        style={{
          width,
          height,
          borderRadius: height,
          backgroundColor: color || colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
