/**
 * Splash Screen — animated logo shown on first launch.
 * Automatically redirects to login after animation completes.
 */
import { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSequence, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const logoOpacity    = useSharedValue(0);
  const logoScale      = useSharedValue(0.7);
  const textOpacity    = useSharedValue(0);
  const dotScale       = useSharedValue(0);

  useEffect(() => {
    // Logo entrance
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
    logoScale.value   = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.5)) });
    // Text fade
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    // Pulse dot
    dotScale.value = withDelay(800, withSequence(
      withTiming(1.2, { duration: 300 }),
      withTiming(1,   { duration: 200 }),
    ));

    // Redirect after animation
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <LinearGradient
      colors={['#0f0f23', '#13131f', '#0f0f23']}
      style={styles.container}
    >
      {/* Background glow */}
      <View style={styles.glow} />

      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <LinearGradient
          colors={['#7c3aed', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Ionicons name="home" size={48} color="#fff" />
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[styles.textWrapper, textStyle]}>
        <Text style={styles.title}>11/38 Home</Text>
        <Text style={styles.subtitle}>Dorm Management System</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f0f23',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124,58,237,0.08)',
    top: height * 0.25,
  },
  logoWrapper: {
    marginBottom: 28,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  textWrapper: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    fontSize: 12,
    color: '#334155',
  },
});
