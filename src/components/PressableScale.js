import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

/**
 * A Pressable that gently scales down while pressed, giving buttons and cards
 * a tactile feel. The scale runs on the native driver so it stays smooth on
 * both Android and iOS. `style` is applied to the inner animated view, so you
 * can pass layout/size styles just like a normal Pressable.
 */
export default function PressableScale({
  children,
  onPress,
  onLongPress,
  scaleTo = 0.96,
  disabled = false,
  style,
  hitSlop,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue, bounciness) =>
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 40,
      bounciness,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => !disabled && animateTo(scaleTo, 0)}
      onPressOut={() => !disabled && animateTo(1, 6)}
      disabled={disabled}
      hitSlop={hitSlop}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}
