import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useEffect } from 'react';
import Colors from '../../constants/colors';

/**
 * Shimmer skeleton loader.
 * Usage: <Skeleton width={200} height={20} borderRadius={8} />
 */
export default function Skeleton({ width = '100%', height = 20, borderRadius = 10, style }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Card skeleton — multiple lines to simulate a loading card.
 */
export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton height={16} width="60%" style={{ marginBottom: 12 }} />
      <Skeleton height={12} width="100%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="80%" />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    marginBottom: 12,
  },
});
