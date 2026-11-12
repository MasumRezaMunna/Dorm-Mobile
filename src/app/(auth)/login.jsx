import { Redirect } from 'expo-router';

/**
 * Authentication is disabled. Redirects immediately to main application.
 */
export default function LoginScreen() {
  return <Redirect href="/(tabs)" />;
}
