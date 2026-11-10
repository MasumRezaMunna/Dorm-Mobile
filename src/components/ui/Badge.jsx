import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';
import { statusLabel } from '../../utils/helpers';

/**
 * Badge — colored pill for status/priority labels.
 * Automatically picks color from Colors.status / Colors.priority maps.
 */
export default function Badge({ label, colorKey, size = 'sm' }) {
  const key = colorKey || label?.toLowerCase().replace(' ', '-');
  const color = Colors.status[key] || Colors.priority[key] || { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' };

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[
        styles.label,
        { color: color.text, fontSize: size === 'sm' ? 11 : 13 },
      ]}>
        {label || statusLabel(key)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
