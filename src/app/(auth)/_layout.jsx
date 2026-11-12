import { Redirect } from 'expo-router';

/**
 * Auth group is disabled — redirects directly to the main application.
 */
export default function AuthLayout() {
  return <Redirect href="/(tabs)" />;
}
