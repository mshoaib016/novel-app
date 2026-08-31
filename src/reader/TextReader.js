import React, { useRef, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

import { useSettings } from '../context/SettingsContext';
import { FONT_FAMILIES } from '../theme/theme';

const READER_THEMES = {
  light: { bg: '#FFFFFF', text: '#141414' },
  dark: { bg: '#0E0E0E', text: '#E8E2D6' },
  sepia: { bg: '#F4ECD8', text: '#5B4A32' },
};

/**
 * Native reflowable reader for text-format novels. Honors all typography
 * settings (family, size, spacing, alignment, margins) with Urdu RTL support.
 */
export default function TextReader({ content, initialPercent = 0, onProgress }) {
  const { settings } = useSettings();
  const scrollRef = useRef(null);
  const [restored, setRestored] = useState(false);
  const metrics = useRef({ contentHeight: 0, layoutHeight: 0 });

  const theme = READER_THEMES[settings.readerTheme] || READER_THEMES.light;
  const family = FONT_FAMILIES.find((f) => f.key === settings.fontFamilyKey)?.family;

  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollable = contentSize.height - layoutMeasurement.height;
    const percent = scrollable > 0 ? Math.min(100, Math.max(0, (contentOffset.y / scrollable) * 100)) : 0;
    if (onProgress) onProgress(percent);
  };

  const maybeRestore = () => {
    if (restored) return;
    const { contentHeight, layoutHeight } = metrics.current;
    if (contentHeight > 0 && layoutHeight > 0 && initialPercent > 0) {
      const y = ((contentHeight - layoutHeight) * initialPercent) / 100;
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: false });
    }
    setRestored(true);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{
        paddingHorizontal: settings.pageMargin,
        paddingVertical: 28,
      }}
      scrollEventThrottle={64}
      onScroll={handleScroll}
      onLayout={(e) => {
        metrics.current.layoutHeight = e.nativeEvent.layout.height;
        maybeRestore();
      }}
      onContentSizeChange={(w, h) => {
        metrics.current.contentHeight = h;
        maybeRestore();
      }}
    >
      <Text
        style={[
          styles.text,
          {
            color: theme.text,
            fontSize: settings.fontSize,
            lineHeight: settings.fontSize * settings.lineHeight,
            textAlign: settings.textAlign,
            fontFamily: family,
            writingDirection: 'rtl',
          },
        ]}
      >
        {content}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  text: {
    // Base; overridden inline from settings.
  },
});
