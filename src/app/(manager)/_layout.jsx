import { Stack } from 'expo-router';

export default function ManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0f172a' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="members" />
      <Stack.Screen name="complaints" />
      <Stack.Screen name="notices" />
      <Stack.Screen name="meals" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="market" />
      <Stack.Screen name="rooms" />
      <Stack.Screen name="expenses" />
      <Stack.Screen name="payments" />
    </Stack>
  );
}
