/**
 * Root layout — sets up:
 *  1. NativeWind CSS import
 *  2. QueryClient (TanStack Query)
 *  3. Auth store hydration + API interceptor wiring
 *  4. Expo Router Slot (renders the active route)
 *  5. Toast provider
 */
import '../global.css';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import useAuthStore from '../store/authStore';
import { configureApiAuth } from '../services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s before refetch
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthGate() {
  const { token, user, isLoading, isPending, hydrate, forceLogout } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // Wire API interceptors once
  useEffect(() => {
    configureApiAuth(
      () => useAuthStore.getState().token,
      () => useAuthStore.getState().forceLogout(),
    );
    hydrate();
  }, []);

  // Navigation guard
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup    = segments[0] === '(auth)';
    const inManagerGroup = segments[0] === '(manager)';
    const isLoggedIn     = !!token && !!user;

    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && isPending && !inAuthGroup) {
      router.replace('/(auth)/pending');
    } else if (isLoggedIn && !isPending && inAuthGroup) {
      // Route to correct dashboard after login
      if (user?.role === 'manager') {
        router.replace('/(manager)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, token, user, isPending, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor="#0f0f23" />
          <AuthGate />
          <Toast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
