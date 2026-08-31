import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Lightweight mount animation wrapper: children fade in and rise slightly.
 * Uses the native driver so it's smooth on both Android and iOS.
 *
 * Props:
 *   delay    - ms before the animation starts (great for staggered lists)
 *   offset   - starting vertical offset in px (default 12, set 0 for pure fade)
 *   duration - ms for the animation (default 420)
 */
export default function FadeInView({
  children,
  delay = 0,
  offset = 12,
  duration = 420,
  style,
  ...rest
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(anim, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => anim.stopAnimation();
  }, [anim, delay, duration]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });

  return (
    <Animated.View style={[{ opacity: anim, transform: [{ translateY }] }, style]} {...rest}>
      {children}
    </Animated.View>
  );
}
