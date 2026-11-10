import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getInitials } from '../../utils/helpers';

/**
 * Avatar — shows profile picture or initials fallback with gradient background.
 */
export default function Avatar({ uri, name = '', size = 40, style }) {
  const initials = getInitials(name);
  const fontSize = Math.max(10, size * 0.35);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  return (
    <LinearGradient
      colors={['#7c3aed', '#2563eb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }, style]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials || '?'}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
