import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

/**
 * EmptyState — centered placeholder when a list has no data.
 * Theme: Mint & Slate muted tokens.
 */
export default function EmptyState({ icon: Icon, title, subtitle, action, style }) {
  return (
    <View style={[styles.root, style]}>
      {Icon && (
        <View style={styles.iconWrapper}>
          <Icon size={38} color="#10b981" />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  action: {
    marginTop: 18,
  },
});
