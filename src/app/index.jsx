import { Redirect } from 'expo-router';

/**
 * Root index — immediately directs users into the main application.
 * No authentication, login, or registration required.
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
