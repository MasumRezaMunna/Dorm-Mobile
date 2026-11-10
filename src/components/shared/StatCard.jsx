import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';

/**
 * StatCard — matches the web app's gradient stat cards.
 * Props:
 *  - title        : Label
 *  - value        : Main displayed number/string
 *  - subtitle     : Small description below value
 *  - gradientColors: Two-color array [start, end]
 *  - icon         : Expo Vector Icon component
 */
export default function StatCard({ title, value, subtitle, gradientColors = ['#7c3aed', '#2563eb'], icon: Icon, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.header}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBg}
        >
          {Icon && <Icon size={18} color="#fff" />}
        </LinearGradient>
      </View>
      <Text style={styles.value} numberOfLines={1}>{value ?? '—'}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    flex: 1,
    minWidth: 140,
  },
  header: {
    marginBottom: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 4,
  },
});
