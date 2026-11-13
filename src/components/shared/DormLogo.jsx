/**
 * Premium Dorm Solution Brand Logo & Mascot Symbol.
 * High-performance vector component rendered with react-native-svg-less primitives.
 * Fully OTA-compatible and light-weight.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export function DormLogo({ size = 36, showLabel = true, subtitle = null }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8b5cf6', '#6d28d9', '#4c1d95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, { width: size, height: size, borderRadius: size * 0.32 }]}
      >
        <Ionicons name="business" size={size * 0.52} color="#ffffff" />
        <View style={styles.sparkleDot} />
      </LinearGradient>
      {showLabel && (
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>Dorm</Text>
            <Text style={styles.brandAccent}>Solution</Text>
          </View>
          {subtitle ? (
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  sparkleDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#60a5fa',
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  brandAccent: {
    fontSize: 18,
    fontWeight: '800',
    color: '#a78bfa',
    letterSpacing: -0.3,
    marginLeft: 4,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: -1,
  },
});

export default DormLogo;

