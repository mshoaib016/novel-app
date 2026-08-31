import React from 'react';
import { FlatList } from 'react-native';

import { NovelCard } from './NovelCard';
import { SPACING } from '../theme/theme';

/**
 * Horizontal carousel of novel poster cards.
 */
export default function HorizontalList({ data, onPressItem, cardWidth = 140, showProgress = false }) {
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xs }}
      renderItem={({ item }) => (
        <NovelCard
          novel={item}
          width={cardWidth}
          onPress={() => onPressItem(item)}
          showProgress={showProgress}
        />
      )}
    />
  );
}
