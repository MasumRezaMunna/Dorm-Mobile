import { Redirect } from 'expo-router';
import useAuthStore from '../store/authStore';

/**
 * Root index — redirects immediately based on auth state.
 */
export default function Index() {
  const { token, user, isLoading, isPending } = useAuthStore();

  if (isLoading) return null;

  if (!token || !user) return <Redirect href="/(auth)/login" />;
  if (isPending)        return <Redirect href="/(auth)/pending" />;
  if (user.role === 'manager') return <Redirect href="/(manager)" />;
  return <Redirect href="/(tabs)" />;
}
