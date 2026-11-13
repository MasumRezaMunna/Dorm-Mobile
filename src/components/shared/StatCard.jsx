import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../constants/colors';

/**
 * StatCard — displays a single overview metric with gradient icon background.
 * Theme: Refined Forest Green, Emerald & Mint accents.
 */
export default function StatCard({ title, value, subtitle, gradientColors = ['#059669', '#10b981'], icon: Icon, style }) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconWrapper}
        >
          {Icon && <Icon size={16} color="#ffffff" />}
        </LinearGradient>
      </View>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card, // #1e293b
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
});
