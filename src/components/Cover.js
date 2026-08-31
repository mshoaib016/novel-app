import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { coverColorsFor } from '../utils/format';
import { RADIUS } from '../theme/theme';

/**
 * Novel cover.
 *
 * - If the novel has a `cover` (a require('...jpg') image or a URL string),
 *   that artwork is shown. THIS IS WHAT YOU WANT: add your own cover photos in
 *   src/data/novels.js (see the "COVER PHOTOS" guide at the top of that file).
 * - Otherwise we draw a clean, deterministic gradient placeholder with a small
 *   book emblem. It intentionally shows NO title text, so covers look tidy
 *   until you drop in your own images.
 */
export default function Cover({ novel, width = 120, height = 170, radius = RADIUS.md, style }) {
  const [c1, c2] = coverColorsFor((novel?.id || '') + (novel?.title || ''));

  if (novel?.cover) {
    return (
      <Image
        source={typeof novel.cover === 'string' ? { uri: novel.cover } : novel.cover}
        style={[{ width, height, borderRadius: radius, backgroundColor: c1 }, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <LinearGradient
      colors={[c1, c2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { width, height, borderRadius: radius }, style]}
    >
      {/* soft decorative disc */}
      <View
        style={[
          styles.disc,
          { width: width * 0.62, height: width * 0.62, borderRadius: width * 0.62 },
        ]}
      />
      {/* centered book emblem (no title text) */}
      <Ionicons name="book" size={width / 3} color="rgba(255,255,255,0.92)" />
      {/* spine + bottom band for a book-like feel */}
      <View style={styles.spine} />
      <View style={styles.bottomBand} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disc: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  spine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  bottomBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
});
