/**
 * Login Screen — Google OAuth via server-side proxy.
 *
 * This bypasses the deprecated Expo auth proxy completely.
 *
 * Flow:
 *  1. User taps "Continue with Google"
 *  2. App opens {SERVER}/api/auth/mobile/google in a secure browser
 *  3. Server redirects to Google → user signs in
 *  4. Google redirects to server callback → server issues JWT
 *  5. Server redirects to deep link: 467home://auth?token=JWT&user=...
 *  6. App catches the deep link, saves token, navigates to home
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';

import useAuthStore from '../../store/authStore';

// Required for expo-web-browser on Android
WebBrowser.maybeCompleteAuthSession();

/**
 * Derives the server base URL automatically from Expo's Metro host.
 * Same logic as api.js — no manual IP config needed.
 */
const getServerUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api\/?$/, '');
  }
  if (__DEV__) {
    const hostUri =
      Constants.expoConfig?.hostUri ??
      Constants.manifest2?.extra?.expoClient?.hostUri ??
      Constants.manifest?.debuggerHost;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      return `http://${ip}:5000`;
    }
  }
  return 'http://localhost:5000';
};

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const cardOpacity    = useSharedValue(0);
  const cardTranslateY = useSharedValue(40);

  useEffect(() => {
    cardOpacity.value    = withDelay(100, withTiming(1, { duration: 600 }));
    cardTranslateY.value = withDelay(100, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }));
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const onGooglePress = async () => {
    try {
      setIsLoading(true);

      // Auto-detected server URL (no .env changes needed when IP changes)
      const serverUrl = getServerUrl();
      const authUrl = `${serverUrl}/api/auth/mobile/google`;
      const redirectUrl = Linking.createURL('auth');

      // Open the browser — it will close automatically when the deep link is intercepted
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        handleDeepLink(result.url);
      } else if (result.type !== 'cancel') {
        Alert.alert('Login Failed', 'Sign in was not completed. Please try again.');
      }
    } catch (err) {
      console.error('[Login Error]', err);
      Alert.alert('Login Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepLink = async (url) => {
    try {
      const parsed = Linking.parse(url);
      const { token, user: userStr, error } = parsed.queryParams || {};

      if (error) {
        Alert.alert('Login Failed', decodeURIComponent(error));
        return;
      }

      if (!token || !userStr) {
        Alert.alert('Login Failed', 'Invalid response from server. Please try again.');
        return;
      }

      const user = JSON.parse(decodeURIComponent(userStr));
      await setAuth({ user, token });
      // Navigation is handled by the auth guard in _layout.jsx

    } catch (err) {
      console.error('[Deep Link Error]', err);
      Alert.alert('Login Failed', 'Could not process sign-in response.');
    }
  };

  return (
    <LinearGradient
      colors={['#0f0f23', '#13131f']}
      style={styles.container}
    >
      {/* Background blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      {/* Logo area */}
      <View style={styles.logoArea}>
        <LinearGradient
          colors={['#7c3aed', '#2563eb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <Ionicons name="home" size={36} color="#fff" />
        </LinearGradient>
        <Text style={styles.appName}>11/38 Home</Text>
        <Text style={styles.tagline}>Dorm Management System</Text>
      </View>

      {/* Login Card */}
      <Animated.View style={[styles.card, cardStyle]}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardSubtitle}>
          Sign in with your Google account to continue.
        </Text>

        <TouchableOpacity
          onPress={onGooglePress}
          disabled={isLoading}
          activeOpacity={0.85}
          style={[styles.googleBtn, isLoading && styles.disabled]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <View style={styles.googleIcon}>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Only residents of 11/38 Home can sign in.{'\n'}
          Contact the manager if you need access.
        </Text>
      </Animated.View>

      <Text style={styles.footer}>© 2025 11/38 Home</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 300,
    height: 300,
    backgroundColor: 'rgba(124,58,237,0.07)',
    top: -60,
    right: -80,
  },
  blob2: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(37,99,235,0.06)',
    bottom: 40,
    left: -60,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(30,30,48,0.95)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 28,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    gap: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  googleIcon: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 2,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  note: {
    marginTop: 24,
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    fontSize: 12,
    color: '#1e293b',
  },
});
