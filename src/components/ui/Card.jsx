import { View, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

/**
 * Card — a rounded surface matching the web app's dark card style.
 * Supports optional padding size and border visibility.
 */
export default function Card({ children, style, padding = 'md', noBorder = false }) {
  const paddings = { sm: 12, md: 16, lg: 20, xl: 24 };
  return (
    <View style={[
      styles.card,
      { padding: paddings[padding] ?? 16 },
      noBorder && { borderWidth: 0 },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
});
